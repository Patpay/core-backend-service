const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const chargeSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['Percentage', 'Fixed'],
    },
    status: {
      type: Boolean,
      default: true,
    },
    currencyCode: {
      type: String,
      sparse: true,
      default: 'NGN',
      index: true,
    },
    value: {
      type: Number,
      default: 0,
    },
    range: {
      min: { type: Number },
      max: { type: Number },
    },
    name: {
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
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('Charge', chargeSchema);