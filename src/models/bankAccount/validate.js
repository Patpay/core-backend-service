const mongoose = require('mongoose');

async function validateBankAccount(val) {
  const BankAccount = mongoose.model('BankAccount');
  try {
    const bankAccount = await BankAccount.findById(val).lean().exec();
    return Boolean(bankAccount);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateBankAccount,
};
