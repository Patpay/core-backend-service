const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const walletSchema = new mongoose.Schema(
  {
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    chargeStampDuty: {
      type: Boolean,
      default: false,
    },
    currencyCode: {
      type: String,
      sparse: true,
      default: 'NGN',
      index: true,
    },
    previousBalance: {
      type: Number,
      default: 0,
      min: 0,
    },
    dailyTransferLimit: {
      type: Number,
      default: 50000,
      min: 0,
    },
    weeklyTransferLimit: {
      type: Number,
      default: 200000,
      min: 0,
    },
    monthlyTransferLimit: {
      type: Number,
      default: 500000,
      min: 0,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      sparse: true,
      validate: validateUser,
    },
    status: {
      type: String,
      default: 'ACTIVE',
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    },
  },

  {
    strict: 'throw',
    timestamps: true,
    versionKey: 'version',
  },
);

module.exports = mongoose.model('Wallet', walletSchema);
