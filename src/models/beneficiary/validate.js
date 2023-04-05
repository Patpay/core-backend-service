const mongoose = require('mongoose');

async function validateBeneficiary(val) {
  const Beneficiary = mongoose.model('Beneficiary');
  try {
    const beneficiary = await Beneficiary.findById(val).lean().exec();
    return Boolean(beneficiary);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateBeneficiary,
};
