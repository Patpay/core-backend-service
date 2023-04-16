/* eslint-disable max-len */
/* eslint-disable no-await-in-loop */
/* eslint-disable no-return-await */
/* eslint-disable global-require */
/* eslint-disable no-underscore-dangle */
/* eslint-disable no-param-reassign */
const { isValidObjectId } = require('mongoose');
const mongoose = require('mongoose');
const moment = require('moment');
const { v4: uuid } = require('uuid');
const constants = require('../utils/constants');
const { logger } = require('../utils/logger');
const constant = require('../utils/constants');
const { postRequest } = require('../utils/request');
const { amountFormatter } = require('../utils/utils');

module.exports = {
  transactionService() {
    const {
      Transaction,
    } = require('../models/index');

    return {
      async createExpense(payload) {
        try {
          if (!payload.transactionReference) {
            payload.transactionReference = uuid();
          }
          payload.type = constants.TRANSACTION_TYPE.EXPENSE;
          payload.status = constants.TRANSACTION_STATUS.PAID;

          const transaction = await Transaction.create(payload);
          return { message: constants.SUCCESS, transactionId: transaction._id };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  Transaction
            *_Function_*: createExpense`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async createIncome(payload) {
        try {
          if (!payload.transactionReference) {
            payload.transactionReference = uuid();
          }
          payload.type = constants.TRANSACTION_TYPE.INCOME;
          payload.status = constants.TRANSACTION_STATUS.PAID;
          if (!payload.currencyCode) {
            payload.currencyCode = 'NGN';
          }
          const transaction = await Transaction.create(payload);
          return { message: constants.SUCCESS, transactionId: transaction._id};
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  Transaction
            *_Function_*: createIncome`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getAll({
        offset = 0,
        limit = 2000,
        startDate,
        currencyCode,
        subWallet,
        endDate,
        dateField,
        type,
        isSubWallet = false,
        user,
      } = {}) {
        try {
          const query = {};
          if (dateField && startDate && endDate) {
            query[dateField] = {
              $gte: new Date(moment(startDate)),
              $lte: new Date(moment(endDate).add(1, 'd')),
            };
          }
          if (type) {
            query.type = type;
          }
          if (currencyCode) {
            query.currencyCode = currencyCode;
          }
          if (user) {
            if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
            query.user = user;
          }

          if (isSubWallet || subWallet) {
            if (subWallet) {
              if (!isValidObjectId(subWallet)) { return { error: constants.NOT_FOUND }; }
              query.subWallet = subWallet;
            } else {
              query.subWallet = { $exists: true };
            }
            query.category = constant.CATEGORY.WALLET;
          }
          const totalCounts = await Transaction.countDocuments(query);
          const value = await Transaction.find(query)
            .populate(
              'user expenseCategory',
              ' name firstname lastname',
            )
            .populate('transaction')
            .populate('transfer', 'transferReceiptUrl')
            .skip(offset)
            .sort({ createdAt: -1 })
            .limit(limit);
          return {
            value,
            totalCounts,
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
            *_Service_*: Transaction
            *_Function_*: getAll`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async calculateCurrentMonthTransferCount(user) {
        try {
          if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
          const query = {
            createdAt: {
              $gte: new Date(moment().startOf('month').toDate()),
              $lte: new Date(moment().endOf('month').add(1, 'hour')),
            },
            type: 'EXPENSE',
            user,
          };
          const count = await Transaction.countDocuments(query);
          return count;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          // postRequest(
          //   'https://hooks.slack.com/services/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',
          //   {
          //     text: `${JSON.stringify(error.message)}
          // *_Service_*:  Transaction
          // *_Function_*: calculateCurrentMonthTransferCount`,
          //   },
          // );
          return { error: constants.GONE_BAD };
        }
      },
      async calculateCurrentDailyTransferCount(user) {
        try {
          if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
          const query = {
            createdAt: {
              $gte: new Date(moment().startOf('day')),
              $lte: new Date(moment().endOf('day')),
            },
            type: 'EXPENSE',
            user,
          };
          const count = await Transaction.countDocuments(query);
          return count;
        } catch (error) {
          logger.log({
            level: 'error',
            message: error,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(error.message)}
          *_Service_*:  Transaction
          *_Function_*: calculateCurrentMonthTransferCount`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async calculateTransactionAmount({
        user, currencyCode, transactionAmount, wallet,
      }) {
        try {
          if (!isValidObjectId(user)) return { error: constants.NOT_FOUND };
          const query = {
            currencyCode,
            createdAt: {
              $gte: new Date(moment().startOf('day').toDate()),
              $lte: new Date(moment().endOf('day').add(1, 'hour')),
            },
            type: 'EXPENSE',
            user: mongoose.Types.ObjectId(user),
          };

          const dailyTransactions = await Transaction.aggregate([
            {
              $match: query,
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amountPaid' },
              },
            },
          ]);
          query.createdAt = {
            $gte: new Date(moment().startOf('week').toDate()),
            $lte: new Date(moment().endOf('week').add(1, 'hour')),
          };
          const weeklyTransactions = await Transaction.aggregate([
            {
              $match: query,
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amountPaid' },
              },
            },
          ]);
          query.createdAt = {
            $gte: new Date(moment().startOf('month').toDate()),
            $lte: new Date(moment().endOf('month').add(1, 'hour')),
          };
          const monthlyTransactions = await Transaction.aggregate([
            {
              $match: query,
            },
            {
              $group: {
                _id: null,
                total: { $sum: '$amountPaid' },
              },
            },
          ]);
          const daily = dailyTransactions[0]?.total || 0;
          const weekly = weeklyTransactions[0]?.total || 0;
          const monthly = monthlyTransactions[0]?.total || 0;
          if ((daily + transactionAmount >= wallet.dailyTransferLimit
              || weekly + transactionAmount >= wallet.weeklyTransferLimit
              || monthly + transactionAmount >= wallet.monthlyTransferLimit)
          ) {
            if (daily + transactionAmount > wallet.dailyTransferLimit) {
              return { error: ` ${amountFormatter(currencyCode).format(wallet.dailyTransferLimit)} ${constants.DAILY_LIMIT_EXCEEDED_UNVERIFIED}` };
            }
            if (weekly + transactionAmount > wallet.weeklyTransferLimit) {
              return { error: ` ${amountFormatter(currencyCode).format(wallet.weeklyTransferLimit)} ${constants.WEEKLY_LIMIT_EXCEEDED_UNVERIFIED}` };
            }
            if (monthly + transactionAmount > wallet.monthlyTransferLimit) {
              return { error: ` ${amountFormatter(currencyCode).format(wallet.monthlyTransferLimit)} ${constants.MONTHLY_LIMIT_EXCEEDED_UNVERIFIED}` };
            }
          }
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
          *_Service_*:  Transaction
          *_Function_*: calculateTodayTransactionAmount`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async getById(id, user) {
        try {
          if (!isValidObjectId(id)) {
            return { error: constants.NOT_FOUND };
          }
          const value = await Transaction.findById({
            _id: id,
            user,
          }).populate('user', 'firstname lastname fullname');
          if (!value) {
            return { error: constants.NOT_FOUND };
          }
          return value;
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest(
            'https://hooks.slack.com/services/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',
            {
              text: `${JSON.stringify(ex.message)}
            *_Service_*:  Transaction
            *_Function_*: getById`,
            },
          );
          return { error: constants.GONE_BAD };
        }
      },
      async transactionSummary(payload, isAdmin) {
        try {
          let totalIncome = 0;
          let totalExpenses = 0;
          let totalExpectedBalance = 0;
          let totalAmountOwed = 0;
          let totalVAT = 0;
          let totalDiscount = 0;
          const query = { status: { $ne: constants.TRANSACTION_STATUS.VOID } };
          if (isAdmin) {
            query.category = constants.CATEGORY.WALLET;
          }

          if (payload.subWallet) {
            query.subWallet = mongoose.Types.ObjectId(payload.subWallet);
          }
          if (payload.user) {
            query.user = mongoose.Types.ObjectId(payload.user);
          }
          if (payload.startDate && payload.endDate && payload.dateField) {
            query[payload.dateField] = {
              $gte: new Date(moment(payload.startDate)),
              $lte: new Date(moment(payload.endDate).add(1, 'd')),
            };
          }
          const transactions = await Transaction.aggregate([
            {
              $match: {
                ...query,
                $and: [{
                  $or: [{ adminTran: false },
                    { adminTran: { $exists: false } }],
                },
                {
                  $or: [{ inflowType: constant.FLOW_TYPE.Income },
                    { inflowType: { $exists: false } },
                    { inflowType: constant.FLOW_TYPE.Expense },
                    { inflowType: constant.FLOW_TYPE.Debt }],

                },
                { status: { $ne: constants.TRANSACTION_STATUS.VOID } },
                { status: { $ne: constants.TRANSACTION_STATUS.NOT_PAID } },
                ],
              },
            },
            {
              $group: {
                _id: '$type',
                total: { $sum: '$amountPaid' },
                totalDeposit: { $sum: '$deposit' },
                totalDiscount: { $sum: '$discountAmount' },
                totalVAT: { $sum: '$vat' },
              },
            },
          ]);
          const transNetCapital = await Transaction.aggregate([
            {
              $match: {
                ...query,
                $and: [{
                  $or: [{ adminTran: false },
                    { adminTran: { $exists: false } }],
                },
                {
                  inflowType: constant.FLOW_TYPE.Funding,
                },
                { status: { $ne: constants.TRANSACTION_STATUS.VOID } },
                { status: { $ne: constants.TRANSACTION_STATUS.NOT_PAID } },
                ],
              },
            },
            {
              $group: {
                _id: '$inflowType',
                total: { $sum: '$amountPaid' },
              },
            },
          ]);
          transactions.map(async (transaction) => {
            if (
              transaction
              && transaction._id === constants.TRANSACTION_TYPE.INCOME
            ) {
              totalIncome = transaction.total;
              totalVAT = transaction.totalVAT || 0;
              totalDiscount = transaction.totalDiscount || 0;
            }
            if (
              transaction
              && transaction._id === constants.TRANSACTION_TYPE.EXPENSE
            ) {
              totalExpenses = transaction.total;
            }
            if (
              transaction
              && transaction._id === constants.TRANSACTION_TYPE.INCOME_DEBT
            ) {
              totalExpectedBalance = transaction.totalDeposit;
            }
            if (
              transaction
              && transaction._id === constants.TRANSACTION_TYPE.EXPENSE_DEBT
            ) {
              totalAmountOwed = transaction.totalDeposit;
            }
          });
          query.type = constant.TRANSACTION_TYPE.INCOME;
          query.$and = [{
            $or: [{ adminTran: false }, { adminTran: { $exists: false } }],
          },
          {
            $or: [{
              status: constant.TRANSACTION_STATUS.PAID,
            },
            {
              status: constant.TRANSACTION_STATUS.PARTIALLY_PAID,
            },
            ],
          },
          ];
          const soldQuantities = await Transaction.aggregate([
            {
              $match: query,
            },
            { $unwind: { path: '$orders', preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: '$type',
                totalQuantity: { $sum: '$orders.quantity' },
              },
            },
          ]);
          const totalSoldQuantities = (soldQuantities.length > 0)
            ? soldQuantities[0].totalQuantity
            : 0;
          return {
            totalIncome,
            totalExpenses,
            totalVAT,
            totalDiscount,
            totalNetCapital: transNetCapital[0] ? transNetCapital[0].total : 0,
            totalExpectedBalance,
            totalAmountOwed,
            totalSoldQuantities,
          };
        } catch (ex) {
          logger.log({
            level: 'error',
            message: ex,
          });
          postRequest('https://hooks.slack.com/services/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', {
            text: `${JSON.stringify(ex.message)}
            *_Service_*:  Transaction
            *_Function_*: transactionSummary`,
          });
          return { error: constants.GONE_BAD };
        }
      },
    };
  },
};
