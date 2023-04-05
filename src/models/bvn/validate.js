const mongoose = require('mongoose');

async function validateBvn(val) {
  const BVN = mongoose.model('BVN');
  try {
    const bvn = await BVN.findById(val).lean().exec();
    return Boolean(bvn);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateBvn,
};
