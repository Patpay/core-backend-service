const mongoose = require('mongoose');

const kudaTransferTrackerSchema = new mongoose.Schema({
  clientAccountNumber: {
    type: String,
  },
  beneficiarybankCode: {
    type: String,
  },
  beneficiaryAccount: {
    type: String,
  },
  beneficiaryName: {
    type: String,
  },
  amount: {
    type: Number,
  },
  narration: {
    type: String,
  },
  nameEnquirySessionID: {
    type: String,
  },
  requestRef: {
    type: String,
  },
  senderName: {
    type: String,
  },
  trackingReference: {
    type: String,
  },
  nameEnquiryId: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('KudaTransferTracker', kudaTransferTrackerSchema)