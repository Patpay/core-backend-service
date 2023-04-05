const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const kudaSchema = new mongoose.Schema(
  {
    accountNumber: {
      type: String,
      required: true,
    },
    trackingReference: {
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

module.exports = mongoose.model('Kuda', kudaSchema);
