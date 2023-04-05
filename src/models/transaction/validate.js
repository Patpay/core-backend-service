const mongoose = require('mongoose');

async function validateTransaction(val) {
  const Transaction = mongoose.model('Transaction');
  try {
    const transaction = await Transaction.findById(val).lean().exec();
    return Boolean(transaction);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateTransaction,
};
