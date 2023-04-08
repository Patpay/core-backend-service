/* eslint-disable global-require */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
const { isValidObjectId } = require('mongoose');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const { postRequest } = require('../utils/request');

module.exports = {
  walletService() {
    const {
      Wallet,
    } = require('../models/index');
    return {
      async createWallets(payload) {
        try {
          const ngnWallet = await Wallet.findOne(payload);
          if (ngnWallet) {
            return { error: constants.EXIST };
          }
          payload.currencyCode = 'NGN';
          const wallet = await Wallet.create(payload);

          return {
            msg: constants.SUCCESS,
            wallets: wallet._id,
          };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  wallet
            *_Function_*: createWallets`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getAll({
        offset = 0,
        limit = 100,
        status,
        user,
        balance,
      } = {}) {
        const query = {};
        if (user) {
          if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
          query.user = user;
        }
        if (balance) {
          query.balance = { $lte: balance };
        }
        if (status) {
          query.status = status;
        }
        const totalCounts = await Wallet.countDocuments(query);
        const value = await Wallet.find(query)
          .populate('user', 'firstname lastname fullname')
          .skip(offset)
          .sort({ createdAt: -1 })
          .limit(limit);
        return {
          totalCounts,
          value,
        };
      },
      async updateWallet({
        amount, type, id,
        currencyCode = 'NGN',
      }) {
        try {
          if (!isValidObjectId(id)) {
            return { error: constants.NOT_FOUND };
          }
          const findQuery = { status: 'ACTIVE', currencyCode };
          if (id) {
            findQuery.user = id;
          }
          const value = await Wallet.findOne(findQuery);
          if (value) {
            const updateQuery = {
              previousBalance: value.balance,
              $inc: { balance: type === 'credit' ? amount : -amount },
            };
            const updatedWallet = await Wallet.findOneAndUpdate(
              findQuery,
              updateQuery,
              { new: true },
            ).populate('user', 'email firstname lastname');
            if (updatedWallet) {
              return updatedWallet;
            }
          }
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
            *_Service_*:  user
            *_Function_*: updateWallet`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getWallets(payload) {
        payload.status = 'ACTIVE';
        const wallets = await Wallet.find(payload)
          .populate('user', ' firstname lastname bvnStatus');
        if (wallets.length === 0) return { error: constants.NOT_FOUND };
        return wallets;
      },
      async getWallet(payload) {
        if (!payload.currencyCode) {
          payload.currencyCode = 'NGN';
        }
        payload.status = 'ACTIVE';
        const wallet = await Wallet.findOne(payload)
          .populate('user');

        if (!wallet) return { error: constants.NOT_FOUND };
        return wallet;
      },

    };
  },
};
