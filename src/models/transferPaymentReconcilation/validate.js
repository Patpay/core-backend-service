const mongoose = require('mongoose');

async function validateTransferRecon(val) {
  const TransferRecon = mongoose.model('TransferRecon');
  try {
    const transferRecon = await TransferRecon.findById(val).lean().exec();
    return Boolean(transferRecon);
  } catch (ex) {
    return false;
  }
};

module.exports = {
    validateTransferRecon,
}