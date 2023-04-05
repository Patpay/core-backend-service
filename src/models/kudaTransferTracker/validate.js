const mongoose = require('mongoose');

async function validateKudaTransferTracker(val) {
  const KudaTransferTracker = mongoose.model('KudaTransferTracker');
  try {
    const kudaTransferTracker = await KudaTransferTracker.findById(val).lean().exec();
    return Boolean(kudaTransferTracker);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateKudaTransferTracker,
};
