/* eslint-disable consistent-return */
/* eslint-disable max-len */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
/* eslint-disable no-return-await */
const { isValidObjectId } = require('mongoose');
const config = require('config');
const { v4: uuid } = require('uuid');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { postRequest } = require('../utils/request');

module.exports = {
  bankAccountService() {
    const {
      User, BankAccount, Kuda,
    } = require('../models/index');
    const { userService } = require('.');
    return {
      async saveWithdrawalAccount(payload, user) {
        try {
          const validatePin = await userService().validatePin(payload.pin, user);
          if (validatePin) {
            delete payload.pin;
            payload.provider = constants.WITHDRAWAL_ACCOUNT;
            let account = await BankAccount.findOne({ user, accountNumber: payload.accountNumber });
            if (account) {
              return { error: constants.EXIST };
            }
            payload.activated = true;
            payload.isSuccessful = true;
            payload.user = user;
            account = await BankAccount.create(payload);

            if (user) {
              await User.findOneAndUpdate({ _id: user }, {
                withdrawalBankAccount: account._id,
              });
            }

            return account;
          }
          return { error: constants.INVALID_PIN };
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
        }
      },
      async getWithdrawalAcct(user) {
        try {
          if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
          const bankAccount = await BankAccount.findOne({
            provider: constants.WITHDRAWAL_ACCOUNT,
            user,
          });
          if (!bankAccount) {
            return { error: constants.NOT_FOUND };
          }
          return bankAccount;
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
        }
      },
      async getAll({
        offset = 0,
        limit = 100,
        user,
        accountType,
        provider,
      } = {}) {
        try {
          if (user && !isValidObjectId(user)) { return { error: constants.NOT_FOUND }; }
          const query = {};
          if (user) {
            query.user = user;
          }
          if (accountType) {
            query.accountType = accountType;
          }
          if (provider) {
            query.provider = provider;
          }
          const totalBankAccounts = await BankAccount.countDocuments(query);
          const bankAccounts = await BankAccount.find(query)
            .skip(offset)
            .limit(limit)
            .sort({ createdAt: -1 })
            .populate('user');
          return { bankAccounts, totalBankAccounts };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
        }
      },
      async getById(id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const bankAccount = await BankAccount.findById(id).populate(
            'user',
          );
          return { bankAccount };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
        }
      },

      async update(id, payload) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const bankAccount = await BankAccount.findById(id);
          if (!bankAccount) return { error: constants.NOT_FOUND };

          await BankAccount.findByIdAndUpdate(
            id,
            payload,
            {
              new: true,
            },
          );
          return { message: constants.SUCCESS };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
        }
      },
      async createKudaVirtualAccount(payload) {
        try {
          const url = config.Kuda.accountCreationURL;
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
            const errorMessages = JSON.parse(jsonCreateResponse.data.data).Message;

            logger.log({
              level: 'error',
              message: errorMessages,
            });
            return { error: errorMessages };
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
              users: [payload.user],
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
    };
  },
};
