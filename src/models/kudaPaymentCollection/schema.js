const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const kudaPaymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    index: true,
    validate: validateUser,
  },
  payingBank: {
    type: String,
  },
  amount: {
    type: Number,
  },
  transactionReference: {
    type: String,
    required: true,
  },
  narrations: {
    type: String,
  },
  accountName: {
    type: String,
    required: true,
  },
  accountNumber: {
    type: String,
    required: true,
  },
  transactionType: {
    type: String,
  },
  senderName: {
    type: String,
  },
  recipientName: {
    type: String,
  },
  instrumentNumber: {
    type: String,
  },
  sessionId: {
    type: String,
  },
}, { strict: 'throw', timestamps: true });

module.exports = mongoose.model('KudaPaymentCollection', kudaPaymentSchema);