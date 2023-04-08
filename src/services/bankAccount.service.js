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
      User, BankAccount,
    } = require('../models/index');
    return {
      async saveWithdrawalAccount(payload, user) {
        try {
          if (!payload.accountType) {
            payload.accountType = constants.USER_ACCOUNT;
            payload.user = user;
          }
          payload.provider = constants.WITHDRAWAL_ACCOUNT;
          let account = await BankAccount.findOne({ $or: [{ user }, { merchant: payload.merchant }], accountNumber: payload.accountNumber });
          if (account) {
            return { error: constants.EXIST };
          }
          payload.activated = true;
          payload.isSuccessful = true;
          account = await BankAccount.create(payload);

          if (user) {
            await User.findOneAndUpdate({ _id: user }, {
              withdrawalBankAccount: account._id,
            });
          }

          return account;
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

    };
  },
};
