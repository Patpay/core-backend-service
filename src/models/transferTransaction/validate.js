const mongoose = require('mongoose');

async function validateTransferTrans(val) {
  const TransferTrans = mongoose.model('TransferTrans');
  try {
    const transferTrans = await TransferTrans.findById(val).lean().exec();
    return Boolean(transferTrans);
  } catch (ex) {
    return false;
  }
};

module.exports = {
    validateTransferTrans,
}