const mongoose = require('mongoose');

async function validateCharge(val) {
  const Charge = mongoose.model('Charge');
  try {
    const charge = await Charge.findById(val).lean().exec();
    return Boolean(charge);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateCharge,
};
