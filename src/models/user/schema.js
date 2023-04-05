const mongoose = require('mongoose');
const { validateBankAccount } = require('../bankAccount/validate');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      sparse: true,
    },
    token: {
      type: String,
    },
    activated: {
      type: Boolean,
      required: true,
      default: false,
    },
    withdrawalBankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      index: true,
      sparse: true,
      validate: validateBankAccount,
    },
    status: {
      type: String,
      default: 'INACTIVE',
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    },
    bankAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BankAccount',
      index: true,
      sparse: true,
      validate: validateBankAccount,
    },
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
