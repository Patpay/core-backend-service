const mongoose = require('mongoose');

async function validateWallet(val) {
  const Wallet = mongoose.model('Wallet');
  try {
    const wallet = await Wallet.findById(val).lean().exec();
    return Boolean(wallet);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateWallet,
};
