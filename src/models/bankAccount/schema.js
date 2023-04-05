const mongoose = require('mongoose');
const constants = require('../../utils/constants');
const { validateUser } = require('../user/validate');

const bankAccountSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
      validate: validateUser,
    },
    bvn: {
      type: String,
      sparse: true,
    },
    provider: {
      type: String,
      enum: [constants.PROVIDER_PROVIDUS, constants.WITHDRAWAL_ACCOUNT, constants.PROVIDER_KUDA],
      default: constants.PROVIDER_PROVIDUS,
    },
    activated: {
      type: Boolean,
      required: true,
      default: false,
    },
    isSuccessful: {
      type: Boolean,
      default: false,
    },
    bankCode: {
      type: String,
      required: true,
      index: true,
    },
    bank: {
      type: String,
      required: true,
    },
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('BankAccount', bankAccountSchema);
