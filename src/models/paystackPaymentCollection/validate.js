const mongoose = require('mongoose');

async function validatePaystackPaymentCollection(val) {
  const PaystackPaymentCollection = mongoose.model('PaystackPaymentCollection');
  try {
    const paystackPaymentCollection = await PaystackPaymentCollection.findById(val).lean().exec();
    return Boolean(paystackPaymentCollection);
  } catch (ex) {
    return false;
  }
}

module.exports = {
    validatePaystackPaymentCollection,
};
