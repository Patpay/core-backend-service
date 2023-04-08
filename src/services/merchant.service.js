/* eslint-disable no-nested-ternary */
/* eslint-disable no-shadow */
/* eslint-disable global-require */
/* eslint-disable no-unused-expressions */
/* eslint-disable no-sequences */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { isValidObjectId } = require('mongoose');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { postRequest } = require('../utils/request');

module.exports = {
  merchantService() {
    const { Merchant } = require('../models/index');
    const { bankAccountService } = require('.');
    function reformatPhoneNumber(mobile) {
      return mobile.charAt(0) === '2'
        ? `0${mobile.slice(3)}`
        : mobile.charAt(0) === '+'
          ? `0${mobile.slice(4)}`
          : mobile;
    }

    async function checkMerchantExist(merchant) {
      const merchantExist = await Merchant.findOne({
        mobile: merchant.mobile,
        status: 'ACTIVE',
      });
      return merchantExist;
    }
    return {
      async create(payload) {
        try {
          const merchantExist = await checkMerchantExist(payload);
          if (merchantExist) {
            return { error: constants.EXIST };
          }
          const token = Math.floor(Math.random() * 90000) + constants.TOKEN_RANGE;
          payload.merchantId = `${payload.merchantName.substring(0, 5).toUpperCase()}${token}`;
          const validMerchant = await Merchant.findOne({ merchantId: payload.merchantId });
          if (validMerchant) {
            payload.merchantId = `${payload.merchantName.substring(0, 5).toUpperCase()}${token}`;
          }
          payload.mobile = await reformatPhoneNumber(payload.mobile);

          const bankAccountPayload = {
            provider: constants.WITHDRAWAL_ACCOUNT,
            accountType: constants.MERCHANT_ACCOUNT,
          };

          bankAccountPayload.accountName = payload.accountName;
          bankAccountPayload.accountNumber = payload.accountNumber;
          bankAccountPayload.bankCode = payload.bankCode;
          bankAccountPayload.bank = payload.bank;

          delete payload.accountName;
          delete payload.accountNumber;
          delete payload.bankCode;
          delete payload.bank;
          const merchant = await Merchant.create(payload);

          bankAccountPayload.merchant = merchant._id;

          const merchantBank = await bankAccountService().saveWithdrawalAccount(bankAccountPayload);

          await Merchant.findOneAndUpdate({ _id: merchant._id }, {
            bankAccount: merchantBank._id,
          }, { new: true });
          return { message: constants.SUCCESS };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          return { error: constants.GONE_BAD };
        }
      },
      async getAllMerchants({
        offset = 0, limit = 100, status,
      } = {}) {
        const query = {};

        if (status) {
          query.status = status;
        }

        const totalCounts = await Merchant.countDocuments(query);
        const value = await Merchant.find(query)
          .populate(
            'category',
            'name',
          )
          .skip(offset)
          .sort({ merchantName: 1 })
          .limit(limit);
        return {
          totalCounts,
          value,
        };
      },
      async getMerchant(id) {
        if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
        const merchant = await Merchant.findById({ id })
          .populate('category', 'name');
        return merchant;
      },
      async deactivate(id) {
        try {
          if (!isValidObjectId(id)) return { error: constants.NOT_FOUND };
          const merchant = await Merchant.findById(id);
          if (!merchant) {
            return { error: constants.NOT_FOUND };
          }
          await Merchant.findOneAndUpdate(
            {
              _id: id,
            },
            { status: 'INACTIVE' },
            { new: true },
          );
          return constants.SUCCESS;
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  Merchants
            *_Function_*: deactivate`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
    };
  },
};
