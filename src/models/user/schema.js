/* eslint-disable no-unused-vars */
const mongoose = require('mongoose');
const { validateBankAccount } = require('../bankAccount/validate');
const { validateWallet } = require('../wallet/validate');

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
    banaId: {
      type: String,
      required: true,
    },
    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      index: true,
      sparse: true,
      validate: validateWallet,
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
    bvnStatus: {
      type: Boolean,
      default: false,
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
