const mongoose = require('mongoose');

async function validateKuda(val) {
  const Kuda = mongoose.model('Kuda');
  try {
    const kuda = await Kuda.findById(val).lean().exec();
    return Boolean(kuda);
  } catch (ex) {
    return false;
  }
}

module.exports = {
    validateKuda,
};
