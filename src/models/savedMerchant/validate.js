const mongoose = require('mongoose');

async function validateSavedMerchant(val) {
  const SavedMerchant = mongoose.model('SavedMerchant');
  try {
    const savedMerchant = await SavedMerchant.findById(val).lean().exec();
    return Boolean(savedMerchant);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateSavedMerchant,
};
