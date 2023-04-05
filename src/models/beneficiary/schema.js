const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const beneficiarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
      validate: validateUser,
    },
    nickName: {
      type: String,
    },
    accountNumber: {
      type: String,
      required: true,
    },
    accountName: {
      type: String,
      required: true,
    },
    bankCode: {
      type: String,
      required: true,
      index: true,
    },
    bankName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      default: true,
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('Beneficiary', beneficiarySchema);