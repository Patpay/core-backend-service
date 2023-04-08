const mongoose = require('mongoose');

async function validateMerchant(val) {
  const Merchant = mongoose.model('Merchant');
  try {
    const merchant = await Merchant.findById(val).lean().exec();
    return Boolean(merchant);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateMerchant,
};
