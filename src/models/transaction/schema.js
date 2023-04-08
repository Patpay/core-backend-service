const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');
const { validateExpenseCategory } = require('../expenseCategory/validate');
const constants = require('../../utils/constants');

const transactionSchema = new mongoose.Schema(
  {
    transactionAmount: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    currencyCode: {
      type: String,
      sparse: true,
      default: 'NGN',
      index: true,
    },
    expenseCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExpenseCategory',
      index: true,
      sparse: true,
      validate: validateExpenseCategory,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
      validate: validateUser,
    },
    narration: {
      type: String,
    },
    transactionReference: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    type: {
      type: String,
      index: true,
      required: true,
      enum: [
        constants.TRANSACTION_TYPE.EXPENSE,
        constants.TRANSACTION_TYPE.INCOME,
      ],
    },
    status: {
      type: String,
      index: true,
      enum: [
        constants.TRANSACTION_STATUS.PAID,
        constants.TRANSACTION_STATUS.PENDING,
        constants.STATUS.REVERSED,
        constants.STATUS.FAILED,
      ],
      default: constants.TRANSACTION_STATUS.PAID,
    },
    sourceAccountNumber: {
      type: String,
    },
    sourceAccountName: {
      type: String,
    },
    bankName: {
      type: String,
    },
    receiverAccountName: {
      type: String,
    },
    receiverAccountNumber: {
      type: String,
    },
    walletBalance: {
      type: Number,
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('Transaction', transactionSchema);