const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const kudaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    sparse: true,
    validate: validateUser,
  },
  trackingReference: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
}, { strict: 'throw', timestamps: true });

module.exports = mongoose.model('Kuda', kudaSchema)