const mongoose = require('mongoose');

async function validateKudaPaymentCollection(val) {
  const KudaPaymentCollection = mongoose.model('KudaPaymentCollection');
  try {
    const kudaPaymentCollection = await KudaPaymentCollection.findById(val).lean().exec();
    return Boolean(kudaPaymentCollection);
  } catch (ex) {
    return false;
  }
}

module.exports = {
    validateKudaPaymentCollection,
};
