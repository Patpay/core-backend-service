const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const transferReconSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
      sparse: true,
      validate: validateUser,
    },
    transactionAmount: {
      type: String,
      default: 0,
    },
    clientWalletRefundStatus: {
      type: Boolean,
      default: false,
    },
    sourceAccountNumber: {
      type: String,
    },
    sourceAccountName: {
      type: String,
    },
    transactionReference: {
      type: String,
    },
    status: {
      type: String,
      enum: ['REVERSED', 'FAILED'],
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('TransferRecon', transferReconSchema)