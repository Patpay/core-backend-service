/* eslint-disable no-empty-function */
/* eslint-disable max-len */
/* eslint-disable array-callback-return */
/* eslint-disable consistent-return */
/* eslint-disable no-nested-ternary */
/* eslint-disable camelcase */
/* eslint-disable operator-assignment */
/* eslint-disable global-require */
/* eslint-disable no-return-await */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-param-reassign */
const config = require('config');
const crypto = require('crypto');
const { isValidObjectId } = require('mongoose');
const { v4: uuid } = require('uuid');
const moment = require('moment');
const path = require('path');
const { sha512 } = require('js-sha512');
const { logger } = require('../utils/logger');
const constants = require('../utils/constants');
const { postRequest, getRequest } = require('../utils/request');
const { producer } = require('../utils/queue');
const { amountFormatter } = require('../utils/utils');
const banks = require('../utils/banks.json');
const constant = require('../utils/constants');
const paystack = require('../utils/paystackIntegration');

module.exports = {
  bankingService() {
    const {
      transactionService,
      userService,
      walletService,
      chargesService,
    } = require('.');

    const {
      BankAccount,
      ExpenseCategory,
      Transaction,
      KudaPaymentCollection,
      BVN,
      PaystackPaymentCollection,
      Kuda,
      Beneficiary,
      KudaTransferTracker,
      TransferRecon,
      TransferTrans,
      User,
      Wallet,
    } = require('../models/index');

    const sendTransferSuccessNotification = async (
      bankAccount,
      payload,
      type,
    ) => {
      try {
        const walletPayload = {
          currencyCode: payload.currencyCode,
          user: payload.user,
        };
        const wallet = await walletService().getWallet(walletPayload);
        producer({
          data: {
            lastname: bankAccount.user.lastname,
            amount: amountFormatter(payload.currencyCode).format(
              payload.transactionAmount,
            ),
            type: type || 'debit',
            narration: payload.narration,
            date: moment().format('DD-MM-YYYY'),
            balance: amountFormatter(payload.currencyCode).format(
              wallet.balance,
            ),
          },
          type: constants.EMAIL,
          to: bankAccount.user.email,
          templateId: constants.FUND_TRANSFER_TEMPLATE_ID,
        });
        const balance = `Avail Bal: ${amountFormatter(
          payload.currencyCode,
        ).format(parseInt(wallet.balance, 10))}\n`;

        const message = `Txn ${type}
Amt: ${amountFormatter(payload.currencyCode).format(
    parseInt(payload.transactionAmount, 10),
  )}
Desc: ${payload.narration}
${balance}Date: ${new Date().toLocaleString()}`;
        producer({
          to: bankAccount.user.mobile,
          message,
          type: constants.SMS,
        });
      } catch (error) {
        console.log(error);
        logger.log({
          level: 'error',
          message: error,
        });
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(error.message)}
        //   *_Service_*: Banking
        //   *_Function_*: sendTransferSuccessNotification`,
        //   },
        // );
      }
    };

    const creditUserAccount = async (payload, bankAccount) => {
      const id = payload.user;
      const wallet = await walletService().updateWallet({
        amount: payload.amount,
        type: 'credit',
        id,
        currencyCode: payload.currencyCode || 'NGN',
      });
      if (wallet.error) {
        return wallet;
      }
      await transactionService().createIncome({
        currencyCode: payload.currencyCode || 'NGN',
        user: payload.user,
        transactionReference: !payload.transactionReference
          ? uuid()
          : payload.transactionReference,
        narration: payload.narration,
        walletBalance: wallet.balance,
        sourceAccountNumber: payload.sourceAccountNumber || '',
        sourceAccountName: payload.sourceAccountName || '',
        bankName: payload.bankName || '',
        transactionAmount: payload.amount,
        status: constants.TRANSACTION_STATUS.PAID,
      });

      const query = {
        user: payload.user,
      };
      if (!bankAccount) {
        bankAccount = await BankAccount.findOne(query)
          .populate('user', 'mobile email');
      }

      await sendTransferSuccessNotification(
        bankAccount,
        {
          narration: payload.narration,
          currencyCode: payload.currencyCode,
          transactionAmount: payload.amount,
        },
        'credit',
      );
      return true;
    };

    const loginIntoKuda = async () => {
      try {
        const logInUrl = config.kuda.loginURL;
        const loginData = {
          email: config.kuda.email,
          apiKey: config.kuda.apiKey,
        };
        return await postRequest(logInUrl, loginData);
      } catch (error) {
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: ` Login to Kuda Failed}
        // *_Service_*: Banking
        // *_Function_*: loginIntoKuda`,
        //   },
        // );
      }
    };

    const debitUserAccount = async (payload, noNotification) => {
      const walletPayload = {
        currencyCode: payload.currencyCode,
        user: payload.user,
      };
      let wallet = await walletService().getWallet(walletPayload);
      if (
        wallet.error
        || wallet.balance <= 0
        || wallet.balance < payload.amount
      ) {
        return { error: constants.LOW_WALLET_BALANCE };
      }
      const id = payload.user;
      wallet = await walletService().updateWallet({
        amount: payload.amount,
        type: 'debit',
        currencyCode: payload.currencyCode || 'NGN',
        id,
      });
      if (wallet.error) {
        return wallet;
      }
      const expensePayload = {
        currencyCode: payload.currencyCode,
        expenseCategory: payload.expenseCategory,
        user: payload.user,
        walletBalance: wallet.balance,
        transactionReference: payload.transactionReference || uuid(),
        narration: payload.narration,
        receiverAccountNumber: payload.beneficiaryAccountNumber || '',
        receiverAccountName: payload.beneficiaryAccountName || '',
        bankName: payload.bankName || '',
        transactionAmount: payload.amount,
        status: constants.TRANSACTION_STATUS.PAID,
      };

      await transactionService().createExpense(
        expensePayload,
      );

      const bankAccountPayload = {
        user: payload.user,
      };

      const bankAccount = await BankAccount.findOne(bankAccountPayload)
        .populate(
          'user',
          'mobile email firstname lastname',
        );
      if (!noNotification) {
        await sendTransferSuccessNotification(
          bankAccount,
          {
            currencyCode: 'NGN',
            beneficiaryAccountName: payload.beneficiaryAccountName,
            narration: payload.narration,
            transactionAmount: payload.amount,
          },
          'debit',
        );
      }

      return true;
    };

    const savePaystackPaymentCollection = async (type, response) => {
      const collection = await PaystackPaymentCollection.create({
        paymentId: response.id,
        message: response.message,
        gateway_response: response.gateway_response,
        amount: response.amount,
        currency: response.currency,
        status: response.status,
        event: type,
        paid_at: response.paid_at,
        fees: response.fees,
        metadata: response.metadata,
        authorization: {
          authorization_code: response.authorization.authorization_code,
          bin: response.authorization.bin,
          last4: response.authorization.last4,
          exp_month: response.authorization.exp_month,
          channel: response.authorization.channel,
          card_type: response.authorization.card_type,
          bank: response.authorization.bank,
          country_code: response.authorization.country_code,
          brand: response.authorization.brand,
          reusable: response.authorization.reusable,
          signature: response.authorization.signature,
          account_name: response.authorization?.account_name || '',
          receiver_bank_account_number:
            response.authorization.receiver_bank_account_number,
          receiver_bank: response.authorization.receiver_bank,
        },
        paidAt: response.paidAt,
        source: {
          type: response.source.type,
          source: response.source.source,
          entry_point: response.source.entry_point,
          identifier: response.source.identifier,
        },
        channel: response.channel,
        reference: response.reference,
        created_at: response.created_at,
      });
      return collection;
    };
    const saveKudaPaymentCollection = async (payload) => {
      const saveData = await KudaPaymentCollection.create({
        payingBank: payload.payingBank,
        amount: payload.amount,
        transactionReference: payload.transactionReference,
        narrations: payload.narrations,
        accountName: payload.accountName,
        accountNumber: payload.accountNumber,
        transactionType: payload.transactionType,
        senderName: payload.senderName,
        recipientName: payload.recipientName,
        instrumentNumber: payload.instrumentNumber,
        sessionId: payload.SessionId,
      });
      return saveData;
    };
    const addBeneficiary = async (payload) => {
      const {
        beneficiaryAccountNumber: accountNumber,
        beneficiaryAccountName: accountName,
        beneficiaryBank: bankCode,
        bankName,
        nickName,
        user,
      } = payload;
      const beneficiary = await Beneficiary.findOne({
        accountNumber,
        bankCode,
        user,
        status: true,
      });

      if (beneficiary) return;

      const createQuery = {
        accountNumber,
        accountName,
        bankCode,
        bankName,
        user,
      };
      if (nickName) createQuery.nickName = nickName;
      return await Beneficiary.create(createQuery);
    };

    const retrieveBankAccount = async (provider, user) => {
      const query = {
        user,
        isSuccessful: true,
        provider,
      };
      const bankAccount = await BankAccount.findOne(query)
        .populate(
          'user',
          'firstname lastname mobile email',
        );

      if (bankAccount) return bankAccount;
      logger.log({
        level: 'error',
        message: `Unable to retreive account for user::${user}`,
      });
      return false;
    };

    function reformatPhoneNumber(mobile) {
      // eslint-disable-next-line no-nested-ternary
      return mobile.charAt(0) === '2'
        ? `0${mobile.slice(3)}`
        : mobile.charAt(0) === '+'
          ? `0${mobile.slice(4)}`
          : mobile;
    }

    async function sendMoneyPaystack(payload, bankAccount) {
      try {
        const headers = {
          Authorization: `Bearer ${config.paystack.PAYSTACK_SECRET_KEY}`,
        };
        const url = config.paystack.PAYSTACK_BASE_URL;
        const response = await getRequest(
          `${config.paystack.PAYSTACK_BASE_URL}/bank/resolve?account_number=${payload.beneficiaryAccountNumber}&bank_code=${payload.beneficiaryBank}`,
          headers,
        );
        if (response.statusCode !== 200) {
          return { error: constants.BAD_ACCOUNT_NUMBER };
        }

        payload.transactionReference = payload.transactionReference || uuid();
        payload.creditAccount = bankAccount.beneficiaryAccountNumber;
        const metadata = {
          expenseCategory: payload.expenseCategory,
          user: payload.user,
          transactionReference: payload.transactionReference,
        };

        const resp = await postRequest(
          `${url}/transferrecipient`,
          {
            type: 'nuban',
            name: payload.beneficiaryAccountName,
            account_number: payload.beneficiaryAccountNumber,
            bank_code: payload.beneficiaryBank,
            currency: 'NGN',
            metadata,
          },
          headers,
        );

        const initiateTransfer = await postRequest(
          `${url}/transfer`,
          {
            source: 'balance',
            amount: payload.transactionAmount.toFixed(2) * 100,
            recipient: resp.data.data.recipient_code,
            reason: payload.narration,
            metadata,
          },
          headers,
        );
        const bankDetails = banks.filter(
          (bank) => bank.bankCode === payload.beneficiaryBank,
        );
        if (bankDetails.length === 0) {
          return { error: 'Invalid Bank Details' };
        }
        if (initiateTransfer.statusCode === 200) {
          const transfer = initiateTransfer.data.data;
          payload.bankName = bankDetails[0].bankName;
          payload.transferStatus = 'PENDING';
          delete payload.pin;
          delete payload.saveBeneficiary;
          delete payload.nickName;
          delete payload.creditAccount;
          delete payload.trackingReference;
          delete bankAccount.user;
          delete payload.isWithdrawal;
          delete payload.splitTransfer;
          payload.reference = transfer.reference;
          payload.transfersessionid = transfer.transfersessionid;
          payload.transfer_code = transfer.transfer_code;
          payload.currencyCode = 'NGN';

          await TransferTrans.create(payload);

          return { responseCode: initiateTransfer.statusCode };
        }
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(initiateTransfer)}
        //   *_Service_*: Banking
        //   *_Function_*: sendMoneyPaystack`,
        //   },
        // );
        const transferPayload = {
          name: payload.beneficiaryAccountName,
          account_number: payload.beneficiaryAccountNumber,
          bank_code: payload.beneficiaryBank,
          bankName: bankDetails[0].bankName,
          narration: payload.narration,
          expenseCategory: payload.expenseCategory,
          user: payload.user,
          amount: payload.transactionAmount,
          transactionReference: payload.transactionReference,
        };
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(transferPayload)}
        //   *_Service_*: Banking
        //   *_Function_*:Paystack Down Make Transfer sendMoney`,
        //   },
        // );
        return { responseCode: constants.SUCCESS };
      } catch (error) {
        logger.log({
          level: 'error',
          message: error,
        });
        postRequest(
          'https://hooks.slack.com/services/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',
          {
            text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: sendMoneyPaystack`,
          },
        );
        return { error: constants.GONE_BAD };
      }
    }

    async function generateMonnifyToken() {
      const token = await postRequest(`${config.monnify.MONNIFY_BASE_URL}/api/v1/auth/login`, {}, {
        Authorization: `Basic ${Buffer.from(`${config.monnify.MONNIFY_API_KEY}` + ':' + `${config.monnify.MONNIFY_SECRET_KEY}`).toString('base64')}`,
      });
      return token.data.responseBody.accessToken;
    }
    async function sendMoneyMonnify(payload, bankAccount) {
      try {
        const token = await generateMonnifyToken();
        const monnifyHeaders = {
          Authorization: `Bearer ${token}`,
        };
        const paystackHeaders = {
          Authorization: `Bearer ${config.paystack.PAYSTACK_SECRET_KEY}`,
        };
        const response = await getRequest(
          `${config.paystack.PAYSTACK_BASE_URL}/bank/resolve?account_number=${payload.beneficiaryAccountNumber}&bank_code=${payload.beneficiaryBank}`,
          paystackHeaders,
        );
        if (response.statusCode !== 200) {
          return { error: constants.BAD_ACCOUNT_NUMBER };
        }

        payload.transactionReference = payload.transactionReference || uuid();
        payload.creditAccount = bankAccount.beneficiaryAccountNumber;

        const initiateTransfer = await postRequest(
          `${config.monnify.MONNIFY_BASE_URL}/api/v2/disbursements/single`,
          {
            amount: payload.transactionAmount.toFixed(2),
            reference: payload.transactionReference,
            destinationBankCode: payload.beneficiaryBank,
            destinationAccountNumber: payload.beneficiaryAccountNumber,
            destinationAccountName: payload.beneficiaryAccountName,
            sourceAccountNumber: config.monnify.MONNIFY_SOURCE_ACCOUNT_NUMBER,
            currency: 'NGN',
            narration: payload.narration,

          },
          monnifyHeaders,
        );
        c;
        const bankDetails = banks.filter(
          (bank) => bank.bankCode === payload.beneficiaryBank,
        );
        if (bankDetails.length === 0) {
          return { error: 'Invalid Bank Details' };
        }
        if (initiateTransfer.statusCode === 200) {
          const transfer = initiateTransfer.data.responseBody;
          payload.bankName = bankDetails[0].bankName;
          payload.transferStatus = 'PENDING';
          delete payload.pin;
          delete payload.saveBeneficiary;
          delete payload.nickName;
          delete payload.creditAccount;
          delete payload.trackingReference;
          delete bankAccount.user;
          delete payload.isWithdrawal;
          delete payload.splitTransfer;
          payload.reference = transfer.reference;
          payload.transfersessionid = transfer.sessionId;
          payload.currencyCode = 'NGN';

          await TransferTrans.create(payload);
          return {
            responseCode: initiateTransfer.statusCode,
            message: initiateTransfer.data.responseMessage,
          };
        }
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(initiateTransfer)}
        //   *_Service_*: Banking
        //   *_Function_*: sendMoneyMonnify`,
        //   },
        // );
        const transferPayload = {
          name: payload.beneficiaryAccountName,
          account_number: payload.beneficiaryAccountNumber,
          bank_code: payload.beneficiaryBank,
          bankName: bankDetails[0].bankName,
          narration: payload.narration,
          expenseCategory: payload.expenseCategory,
          user: payload.user,
          amount: payload.transactionAmount,
          transactionReference: payload.transactionReference,
        };
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(transferPayload)}
        //   *_Service_*: Banking
        //   *_Function_*:Monnify Down Make Transfer sendMoney`,
        //   },
        // );
        return { error: constants.GONE_BAD };
      } catch (error) {
        logger.log({
          level: 'error',
          message: error,
        });
        postRequest(
          'https://hooks.slack.com/services/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',
          {
            text: `${JSON.stringify(error.message)}
            *_Service_*: Banking
            *_Function_*: sendMoneyMonnify`,
          },
        );
        return { error: constants.GONE_BAD };
      }
    }
    async function sendMoneyKuda(payload, bankAccount) {
      try {
        const url = config.kuda.accountCreationURL;
        const token = await loginIntoKuda();
        if (!token) {
          return { error: constants.GONE_BAD };
        }
        const headers = {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token.data}`,
        };

        // eslint-disable-next-line array-callback-return
        const bankDetails = banks.filter((bank) => {
          if (bank.bankCode === payload.beneficiaryBank) {
            return bank;
          }
        });
        const nameEnquiryPayload = {
          serviceType: 'NAME_ENQUIRY',
          requestRef: uuid(),
          data: {
            beneficiaryAccountNumber: payload.beneficiaryAccountNumber,
            beneficiaryBankCode: bankDetails[0].kudaBankCode,
            SenderTrackingReference: uuid(),
            isRequestFromVirtualAccount: 'True',
          },
        };

        const nameEnquiryJsonData = JSON.stringify(nameEnquiryPayload);
        const nameEnquiryResponse = await postRequest(
          url,
          { data: nameEnquiryJsonData },
          headers,
        );

        const nameEnquiryResponseData = JSON.parse(
          nameEnquiryResponse.data.data,
        );

        // console.log(nameEnquiryResponseData)
        const reference = uuid();
        const dataPayload = {
          trackingReference: uuid(),
          beneficiaryAccount: payload.beneficiaryAccountNumber,
          amount: payload.transactionAmount * 100,
          narration: payload.narration,
          beneficiaryBankCode: bankDetails[0].kudaBankCode,
          beneficiaryName: nameEnquiryResponseData.Data.BeneficiaryName,
          senderName: 'Bana',
          nameEnquiryId: nameEnquiryResponseData.Data.SessionID,
        };
        const data = {
          serviceType: 'VIRTUAL_ACCOUNT_FUND_TRANSFER',
          requestRef: reference,
          data: dataPayload,
        };
        dataPayload.requestRef = reference;
        await KudaTransferTracker.create(dataPayload);
        const jsonData = JSON.stringify(data);
        const jsonRetrieveResponse = await postRequest(
          url,
          { data: jsonData },
          headers,
        );

        const responseData = JSON.parse(jsonRetrieveResponse.data.Data);
        if (
          responseData.ResponseCode
            === constants.PROVIDUS_RESPONSE_SUCCESS_CODE
          && responseData.Status === true
        ) {
          return { message: responseData.Message };
        }
        const transferPayload = {
          name: payload.beneficiaryAccountName,
          account_number: payload.beneficiaryAccountNumber,
          bank_code: payload.beneficiaryBank,
          bankName: bankDetails[0].bankName,
          narration: payload.narration,
          expenseCategory: payload.expenseCategory,
          user: payload.user,
          amount: payload.transactionAmount,
          transactionReference: payload.transactionReference,
        };
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(transferPayload)}
        //     *_Service_*: Banking
        //     *_Function_*:Kuda Down Make Transfer sendMoney`,
        //   },
        // );
        return { error: constants.GONE_BAD };
      } catch (error) {
        logger.log({
          level: 'error',
          message: error,
        });
        // postRequest(
        //   'https://hooks.slack.com/services/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',
        //   {
        //     text: `${JSON.stringify(error.message)}
        //   *_Service_*: Banking
        //   *_Function_*: sendMoneyKuda`,
        //   },
        // );
        return { error: constants.GONE_BAD };
      }
    }

    return {
      async sendMoney(payload, bankAccount) {
        let response = await sendMoneyPaystack(payload, bankAccount);
        if (response.error) {
          response = await sendMoneyMonnify(payload, bankAccount);
        }
        return response;
      },
      async validateBanaAccount(banaId) {
        const banaAccount = await User.findOne({ banaId });
        if (banaAccount) {
          return {
            name: `${banaAccount.firstname} ${banaAccount.lastname}`,
            banaId,
          };
        }
        return { error: constants.NOT_FOUND };
      },

      async sendMoneyToBanaAccount(payload) {
        try {
          const validatePin = await userService().validatePin(
            payload.pin,
            payload.user,
          );
          if (!validatePin || validatePin.error) {
            return validatePin.error
              ? { error: validatePin.error }
              : { error: constants.INVALID_PIN };
          }
          const walletPayload = {
            currencyCode: 'NGN',
            user: payload.user,
          };
          const wallet = await walletService().getWallet(walletPayload);
          if (
            wallet.error
            || wallet.balance <= 0
            || wallet.balance < payload.transactionAmount
          ) {
            return { error: constants.LOW_WALLET_BALANCE };
          }
          const banaAcc = await User.findOne({ banaId: payload.banaId });

          if (!banaAcc) {
            return { error: constants.NOT_FOUND };
          }

          payload.QueueType = constants.TRANSFER_BANA_JOB;
          payload.transactionReference = uuid();
          producer(payload);
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: sendMoneyToBanaAccount`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async sendMoneyToBanaAccountJob(payload) {
        try {
          const { user } = payload;
          delete payload.pin;
          delete payload.QueueType;
          delete payload.banaId;
          const walletCheck = {
            currencyCode: 'NGN',
            user,
          };
          const wallet = await walletService().getWallet(walletCheck);
          if (
            wallet.error
            || wallet.balance <= 0
            || wallet.balance < payload.transactionAmount
          ) {
            return { error: constants.LOW_WALLET_BALANCE };
          }
          const banaAcc = await User.findOne({ banaId: payload.banaId });
          const walletPayload = {
            user,
            narration: payload.narration,
            currencyCode: 'NGN',
            beneficiaryAccountName: `${banaAcc.firstname} ${banaAcc.lastname}`,
            beneficiaryAccountNumber: `${banaAcc.banaId}`,
            bankName: 'Bana Account',
            status: constants.STATUS.PENDING,
            transactionReference: payload.transactionReference,
            amount: parseInt(payload.transactionAmount, 10),
            expenseCategory: payload.expenseCategory || config.migrationIDs.WITHDRAWAL_EXPENSE_CATEGORY_ID,
          };
          const debitResponse = await debitUserAccount(walletPayload, true);

          if (debitResponse === true) {
            const creditWallet = {
              user: banaAcc._id,
              narration: payload.narration,
              currencyCode: 'NGN',
              sourceAccountName: `${banaAcc.firstname} ${banaAcc.lastname}`,
              sourceAccountNumber: `${banaAcc.banaId}`,
              bankName: 'Bana Account',
              status: constants.STATUS.PAID,
              transactionReference: payload.transactionReference,
              amount: parseInt(payload.transactionAmount, 10),
            };

            const banaBankAccount = await BankAccount.findOne({ user: banaAcc._id, provider: constant.PROVIDER_KUDA });
            const response = await creditUserAccount(creditWallet, banaBankAccount);

            if (response) {
              return { message: constants.SUCCESS };
            }
          }
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: sendMoneyToBanaAccount`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async verifyKudaPayment() {
        try {
          const logInUrl = config.kuda.loginURL;
          const loginData = {
            email: config.kuda.email,
            apiKey: config.kuda.apiKey,
          };
          const url = config.kuda.accountCreationURL;
          const token = await postRequest(logInUrl, loginData);
          if (!token) {
            return { error: constants.GONE_BAD };
          }
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.data}`,
          };
          const transfers = await KudaTransferTracker.find();
          const transfersPayload = [];
          for (let index = 0; index < transfers.length; index += 1) {
            const transfer = transfers[index];
            if (transfer.beneficiaryAccount) {
              const transferStatusCheckPayload = {
                serviceType: 'TRANSACTION_STATUS_QUERY',
                requestRef: '',
                data: {
                  transactionRequestReference: transfer.requestRef,
                  isThirdPartyBankTransfer: 'True',
                },
              };
              const transferStatusCheckData = JSON.stringify(
                transferStatusCheckPayload,
              );
              const transferStatusCheckResponse = await postRequest(
                url,
                { data: transferStatusCheckData },
                headers,
              );
              const transferStatusResponseData = JSON.parse(
                transferStatusCheckResponse.data.data,
              );
              // const accounts = await BankAccount.findOne({
              // accountNumber: transfer.beneficiaryAccount }).select('users');
              if (
                transferStatusResponseData.ResponseCode === '2'
                && transferStatusResponseData.Status === true
              ) {
                transfersPayload.push(transfer);
              }
              // else if (transferStatusResponseData.ResponseCode === '-4') {
              //   await Payroll.findOneAndUpdate({
              //     user: accounts.users[0],
              //     tag: 'November-2022',
              //     business: '631b5e0a769d260ff080cf5b',
              //   }, {
              //     $set: {
              //       status: 'REVERSED',
              //     },
              //   });
              // } else {
              //   await Payroll.findOneAndUpdate({
              //     user: accounts.users[0],
              //     tag: 'November-2022',
              //     business: '631b5e0a769d260ff080cf5b',
              //   }, {
              //     $set: {
              //       status: 'PROCESSING',
              //     },
              //   });
              // }
            }
          }

          // eslint-disable-next-line array-callback-return
          // postRequest(
          //   'https://hooks.slack.com/services/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',
          //   {
          //     text: `${JSON.stringify(transfers)}
          //   *_Service_*: Banking
          //   *_Function_*: verifyKudaPayment`,
          //   },
          // );
          // return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error)}
          *_Service_*: Banking
          *_Function_*: verifyKudaPayment`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async createKudaVirtualAccount(payload) {
        try {
          const url = config.kuda.accountCreationURL;
          const logInUrl = config.kuda.loginURL;
          const loginData = {
            email: config.kuda.email,
            apiKey: config.kuda.apiKey,
          };
          const token = await postRequest(logInUrl, loginData);
          if (!token) {
            return { error: constants.GONE_BAD };
          }
          const dataPayload = {
            email: payload.email,
            phoneNumber: payload.mobile.replace(/\s/g, ''),
            lastName: payload.lastname.replace(/\s/g, ''),
            firstName: payload.firstname.replace(/\s/g, ''),
            middleName: '',
            trackingReference: uuid(),
          };
          const data = {
            ServiceType: 'ADMIN_CREATE_VIRTUAL_ACCOUNT',
            RequestRef: uuid(),
            Data: dataPayload,
          };

          const jsonData = JSON.stringify(data);
          const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token.data}`,
          };
          const jsonCreateResponse = await postRequest(
            url,
            { data: jsonData },
            headers,
          );
          if (JSON.parse(jsonCreateResponse.data.data).Status === false) {
            const errorMessage = JSON.parse(jsonCreateResponse.data.data).Message;

            logger.log({
              level: 'error',
              message: errorMessage,
            });
            return { error: errorMessage };
          }
          const responseData = JSON.parse(jsonCreateResponse.data.data);
          if (jsonCreateResponse.statusCode === 200 && responseData.Status === true) {
            const kudaCreatePayload = {
              trackingReference: data.Data.trackingReference,
              accountNumber: responseData.Data.AccountNumber,
            };
            if (payload.user) {
              kudaCreatePayload.user = payload.user;
            }
            await Kuda.create(kudaCreatePayload);

            const account = await BankAccount.create({
              accountName: `${payload.firstname} ${payload.lastname}`,
              accountNumber: responseData.Data.AccountNumber,
              bankCode: '50211',
              provider: constants.PROVIDER_KUDA,
              bank: 'Kuda Bank',
              user: payload.user,
              isSuccessful: responseData.Status,
            });
            return account._id;
          }
          logger.log({
            level: 'error',
            message: 'Unable to create Kuda Account',
          });
          return { error: constants.GONE_BAD };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          return { error: constants.GONE_BAD };
        }
      },

      async debitUser(payload, noNotification) {
        return debitUserAccount(payload, noNotification);
      },
      async creditUser(payload) {
        return await creditUserAccount(payload);
      },
      async getBankAccountDetails({
        user, provider,
      }) {
        try {
          const query = {
            user, provider,
          };
          const bankAccount = await BankAccount.findOne(query);
          if (!bankAccount) {
            return { error: `User Bank Account ${constants.NOT_FOUND}` };
          }
          const headers = {
            Authorization: `Bearer ${config.paystack.PAYSTACK_SECRET_KEY}`,
          };

          const response = await getRequest(
            `${config.paystack.PAYSTACK_BASE_URL}/bank/resolve?account_number=${bankAccount.accountNumber}&bank_code=${bankAccount.bankCode}`,
            headers,
          );
          if (response.statusCode === 200) {
            const { account_name: accountName, account_number: accountNumber } = response.data;
            const walletPayload = { currencyCode: 'NGN', user };
            const wallet = await walletService().getWallet(walletPayload);
            return {
              accountName,
              accountNumber,
              availableBalance: wallet.balance,
            };
          }
          logger.log({
            level: 'error',
            message: response,
          });
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          // postRequest(
          //   'https://hooks.slack.com/services/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',
          //   {
          //     text: `${JSON.stringify(error.message)}
          // *_Service_*: Banking
          // *_Function_*: getBankAcccountDetails`,
          //   },
          // );
          return { error: constants.GONE_BAD };
        }
      },
      async getNIPAccount({ accountNumber, beneficiaryBank: bankCode }) {
        try {
          const beneficiary = await Beneficiary.findOne({
            accountNumber,
            bankCode,
          });
          const bankDetails = banks.filter(
            (bank) => bank.bankCode === bankCode,
          );

          if (beneficiary) {
            return {
              bankCode,
              accountName: beneficiary.accountName,
              accountNumber,
              bankName: bankDetails ? bankDetails[0].bankName : '',
            };
          }

          if (!beneficiary) {
            const headers = {
              Authorization: `Bearer ${config.paystack.PAYSTACK_SECRET_KEY}`,
            };
            const response = await getRequest(
              `${config.paystack.PAYSTACK_BASE_URL}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
              headers,
            );
            const { account_name, account_number } = response.data.data;

            return {
              accountNumber: account_number,
              accountName: account_name,
              bankName: bankDetails ? bankDetails[0].bankName : '',
              bankCode,
              status: true,
            };
          }
          return { error: constants.GONE_BAD };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          // postRequest(
          //   'https://hooks.slack.com/services/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',
          //   {
          //     text: `${JSON.stringify(error.message)}
          // *_Service_*: Banking
          // *_Function_*: getNIPAccount`,
          //   },
          // );
          return { error: constants.UNABLE_TO_RESOLVE_ACCOUNT_NUMBER };
        }
      },
      async processTransfer(payload, isJob) {
        try {
          if (!isJob) {
            const validatePin = await userService().validatePin(
              payload.pin,
              payload.user,
            );

            if (!validatePin || validatePin.error) {
              return validatePin.error
                ? { error: validatePin.error }
                : { error: constants.INVALID_PIN };
            }
          }
          const walletPayload = {
            currencyCode: 'NGN',
            user: payload.user,
          };
          const transferCount = await transactionService().calculateCurrentMonthTransferCount(
            payload.user,
          );
          let chargeAmount = 0;
          let chargeId;
          if (transferCount >= 5) {
            const charge = await chargesService().calculateCharge({
              name: constants.CHARGES.TRANSFER,
              amount: payload.transactionAmount,
            });
            chargeAmount = charge.amount;
            chargeId = charge._id;
          }
          const wallet = await walletService().getWallet(walletPayload);
          if (
            wallet.error
            || wallet.balance <= 0
            || wallet.balance < payload.transactionAmount + chargeAmount
          ) {
            return { error: constants.LOW_WALLET_BALANCE };
          }

          const transactionSummary = await transactionService().calculateTransactionAmount({
            user: payload.user, currencyCode: 'NGN', wallet,
          });
          if (
            !wallet.user.bvnStatus
            && !isJob
            && (transactionSummary.daily + payload.transactionAmount >= 50000
              || transactionSummary.monthly + payload.transactionAmount >= 500000)
          ) {
            return { error: constants.DAILY_LIMIT_EXCEEDED_UNVERIFIED };
          }

          const nipAccountResponse = await this.getNIPAccount({
            accountNumber: payload.beneficiaryAccountNumber,
            beneficiaryBank: payload.beneficiaryBank,
          });
          if (nipAccountResponse.error) return nipAccountResponse;
          payload.beneficiaryAccountName = nipAccountResponse.accountName;
          payload.beneficiaryBank = nipAccountResponse.bankCode;
          payload.charge = {
            amount: chargeAmount,
            addCharge: chargeAmount > 0,
            _id: chargeId,
          };

          payload.QueueType = constants.TRANSFER_JOB;
          payload.transactionReference = uuid();
          producer(payload);
          return { msg: constants.SUCCESS };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: processTransfer`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async processTransferJob(payload) {
        const { user } = payload;
        delete payload.pin;
        delete payload.QueueType;
        const { charge } = payload;
        delete payload.charge;
        const provider = constants.PROVIDER_KUDA;

        const bankAccount = await retrieveBankAccount(
          provider,
          user,
        );
        if (!bankAccount) return { error: constants.GONE_BAD };
        const { saveBeneficiary } = payload;
        const walletCheck = {
          currencyCode: 'NGN',
          user,
        };
        const wallet = await walletService().getWallet(walletCheck);
        let chargeAmount = 0;
        if (charge && charge.addCharge) {
          chargeAmount = charge.amount;
        }

        if (
          wallet.error
          || wallet.balance <= 0
          || wallet.balance < payload.transactionAmount + chargeAmount
        ) {
          return { error: constants.LOW_WALLET_BALANCE };
        }
        if (charge && charge.addCharge) {
          const chargePayload = {
            user,
            narration: 'NIP Transfer Fee',
            isWithdrawal: false,
            beneficiaryAccountName: 'NIP Transfer Fee',
            amount: chargeAmount,
            expenseCategory: config.migrationIDs.TRANSFER_CHARGE_EXPENSE_CATEGORY_ID,
            dueDate: moment(),
          };
          await debitUserAccount(chargePayload, true);
          const inflowPayload = {
            totalCost: payload.transactionAmount,
            value: chargeAmount,
            currencyCode: 'NGN',
            charge: charge._id,
            user: payload.user,
          };

          chargesService().createInflowCharge(inflowPayload);
        }
        const bankDetails = banks.filter(
          (bank) => bank.bankCode === payload.beneficiaryBank,
        );
        const walletPayload = {
          user,
          narration: payload.narration,
          isWithdrawal: payload.isWithdrawal,
          currencyCode: 'NGN',
          beneficiaryAccountName: payload.beneficiaryAccountName,
          beneficiaryAccountNumber: payload.beneficiaryAccountNumber,
          bankName: bankDetails[0].bankName,
          status: constants.STATUS.PENDING,
          transactionReference: payload.transactionReference,
          amount: parseInt(payload.transactionAmount, 10),
          expenseCategory: payload.expenseCategory || config.migrationIDs.WITHDRAWAL_EXPENSE_CATEGORY_ID,
          dueDate: moment(),
        };

        const debitResponse = await debitUserAccount(walletPayload);
        if (debitResponse === true) {
          // let response = await sendMoneyMainKuda(payload, bankAccount);
          // if (response.error) {
          // const response = await sendMoneyKuda(payload, bankAccount);
          // console.log('===sendMoneyKuda=>', response);
          // if (response.error) {
          let response = await sendMoneyPaystack(payload, bankAccount);
          if (response.error) {
            response = await sendMoneyMonnify(payload, bankAccount);
            if (response.error) {
              response = await sendMoneyKuda(payload, bankAccount);
            }
          }
          // const response = await this.sendMoney(payload, bankAccount);
          if (response.error) {
            // postRequest(
            //   'https://hooks.slack.com/services/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',
            //   {
            //     text: `Reversed ${JSON.stringify(payload)}
            // *_Service_*: Banking
            // *_Function_*: Process transfer`,
            //   },
            // );
            walletPayload.narration = `Refund - ${payload.narration}`;
            delete walletPayload.expenseCategory;
            walletPayload.inflowType = constant.FLOW_TYPE.Funding;
            await creditUserAccount(walletPayload);
            return response;
            // }
          //  }
          }

          payload.bankName = bankDetails[0].bankName;
          if (saveBeneficiary) {
            addBeneficiary(payload);
          }
          return { msg: constants.SUCCESS };
        }
        return debitResponse;
      },
      async runValidations(payload) {
        const validatePin = await userService().validatePin(
          payload.pin,
          payload.user,
        );
        if (!validatePin) {
          return { error: constants.INVALID_PIN };
        }
        delete payload.pin;
        const bankBalanceOptions = {
          user: payload.user,
          provider: constants.PROVIDER_KUDA,
        };
        const accountResponse = await this.getBankAccountDetails(
          bankBalanceOptions,
        );
        if (accountResponse.error) return accountResponse;
        if (accountResponse.availableBalance < payload.transactionAmount) {
          return { error: constants.LOW_WALLET_BALANCE };
        }
        return true;
      },
      async getAll({
        offset = 0,
        limit = 100,
        createdAt,
        beneficiaryBank,
        transactionReference,
        responseCode,
        transactionAmount,
      } = {}) {
        // eslint-disable-next-line no-return-await
        const query = {};
        if (transactionReference) {
          query.transactionReference = transactionReference;
        }
        if (beneficiaryBank) {
          query.beneficiaryBank = beneficiaryBank;
        }
        if (responseCode) {
          query.responseCode = responseCode;
        }
        if (transactionAmount) {
          query.transactionAmount = transactionAmount;
        }
        const totalCounts = await TransferTrans.countDocuments(query);
        const response = await TransferTrans.find(query)
          .populate('expenseCategory')
          .skip(offset)
          .sort({ createdAt })
          .limit(limit);
        return {
          value: response,
          totalCounts,
        };
      },
      async createExpenseCategory(payload) {
        try {
          payload.status = true;
          const expenseCategory = await ExpenseCategory.findOne(payload);
          if (expenseCategory) {
            return {
              error: constants.EXIST,
            };
          }
          await ExpenseCategory.create(payload);
          return { message: constants.SUCCESS };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
          *_Service_*: Banking
          *_Function_*: createExpensecategory `,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async deactivate(id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const expenseCategory = await ExpenseCategory.findById(id);

          if (!expenseCategory) {
            return { error: constants.NOT_FOUND };
          }
          return await ExpenseCategory.findOneAndUpdate(
            {
              _id: id,
            },
            { status: false },
            { new: true },
          );
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
          *_Service_*: Banking
          *_Function_*: deactivate`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async deactivateBeneficiary(id, user) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const beneficiary = await Beneficiary.findById(id);

          if (!beneficiary) {
            return { error: constants.NOT_FOUND };
          }
          return await Beneficiary.findOneAndUpdate(
            {
              _id: id,
              user,
            },
            { status: false },
            { new: true },
          );
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
          *_Service_*: Banking
          *_Function_*: deactivateBeneficiary`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async updateExpenseCategory(payload, id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const expCat = await ExpenseCategory.findOneAndUpdate(
            {
              _id: id,
            },
            payload,
            {
              new: true,
            },
          );
          if (!expCat) return { error: constants.NOT_FOUND };
          return expCat;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: updateExpenseCategory`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getAllExpensesCategories({ offset = 0, limit = 100 } = {}) {
        try {
          const totalCounts = await ExpenseCategory.countDocuments({
            status: true,
          });
          const response = await ExpenseCategory.find({ status: true })
            .skip(offset)
            .sort({ name: 1 })
            .limit(limit);
          return {
            value: response,
            totalCounts,
          };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*: Banking
          *_Function_*: getAllExpenseCategory`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getBeneficiaries({
        offset = 0,
        limit = 1000,
        user,
        beneficiaryBank,
      } = {}) {
        try {
          const query = { status: true };
          if (user) {
            query.user = user;
          }
          if (beneficiaryBank) {
            query.beneficiaryBank = beneficiaryBank;
          }
          const totalCounts = await Beneficiary.countDocuments(query);
          const response = await Beneficiary.find(query)
            .select()
            .skip(offset)
            .sort({ createdAt: -1 })
            .limit(limit);
          return {
            value: response,
            totalCounts,
          };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          // postRequest(
          //   'https://hooks.slack.com/services/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',
          //   {
          //     text: `${JSON.stringify(error.message)}
          // *_Service_*: Banking
          // *_Function_*: getBeneficiaries`,
          //   },
          // );
          return { error: constants.GONE_BAD };
        }
      },
    };
  },
};
