const mongoose = require('mongoose');

async function validateInflowCharge(val) {
  const InflowCharge = mongoose.model('InflowCharge');
  try {
    const inflowCharge = await InflowCharge.findById(val).lean().exec();
    return Boolean(inflowCharge);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateInflowCharge,
};
