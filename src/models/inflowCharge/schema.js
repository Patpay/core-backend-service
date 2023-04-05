const mongoose = require('mongoose');
const { validateCharge } = require('../charges/validate');
const { validateUser } = require('../user/validate');

const inflowChargeSchema = new mongoose.Schema(
  {
    charge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Charges',
      index: true,
      required: true,
      validate: validateCharge,
    },
    value: {
      type: Number,
      default: 0,
    },
    totalCost: {
      type: Number,
      default: 0,
    },
    currencyCode: {
      type: String,
      sparse: true,
      default: 'NGN',
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Business',
      index: true,
      sparse: true,
      validate: validateUser,
    },
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('InflowCharge', inflowChargeSchema)