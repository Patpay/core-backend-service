const mongoose = require('mongoose');
const { validateExpenseCategory } = require('../expenseCategory/validate');
const { validateBankAccount } = require('../bankAccount/validate')

const merchantSchema = new mongoose.Schema({
  merchantName: {
    type: String,
    required: true,
  },
  bankAccount: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BankAccount',
    index: true,
    sparse: true,
    validate: validateBankAccount,
  },
  merchantId: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExpenseCategory',
    index: true,
    sparse: true,
    validate: validateExpenseCategory,
  },
  currencyCode: {
    type: String,
    sparse: true,
    default: 'NGN',
    index: true,
  },
  status: {
    type: String,
    default: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE'],
  },
}, { strict: 'throw', timestamps: true });

module.exports = mongoose.model('Merchant', merchantSchema);