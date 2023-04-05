const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');
const { validateExpenseCategory } = require('../expenseCategory/validate');

const transferTransSchema = new mongoose.Schema(
  {
    transactionAmount: {
      type: String,
      required: true,
    },
    transferStatus: {
      type: String,
      enum: ['PENDING', 'SUCCESS', 'FAILED'],
    },
    sourceAccountNumber: {
      type: String,
    },
    sourceAccountName: {
      type: String,
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
    beneficiaryAccountNumber: {
      type: String,
      required: true,
    },
    bankName: {
      type: String,
    },
    beneficiaryAccountName: {
      type: String,
      required: true,
    },
    currencyCode: {
      type: String,
    },
    reference: {
      type: String,
    },
    transfersessionid: {
      type: Array,
    },
    transfer_code: {
      type: String,
    },
    session: {
      id: {
        type: String,
      },
      provider: {
        type: String,
      },
    },
    beneficiaryBank: {
      type: String,
      required: true,
    },
    transactionReference: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    narration: {
      type: String,
    },
    transferReceiptUrl: {
      type: String,
    },
    fileTitle: {
      type: String,
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('TransferTrans', transferTransSchema);