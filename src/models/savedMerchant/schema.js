const mongoose = require('mongoose');
const { validateExpenseCategory } = require('../expenseCategory/validate');
const { validateMerchant } = require('../merchant/validate');
const { validateUser } = require('../user/validate')

const savedMerchantSchema = new mongoose.Schema({
  merchantName: {
    type: String,
    required: true,
  },
  nickName: {
    type: String,
  },
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Merchant',
    index: true,
    sparse: true,
    validate: validateMerchant,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    sparse: true,
    validate: validateUser,
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
  status: {
    type: Boolean,
    default: true,
  },
}, { strict: 'throw', timestamps: true });

module.exports = mongoose.model('SavedMerchant', savedMerchantSchema);