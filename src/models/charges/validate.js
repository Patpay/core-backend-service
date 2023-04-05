const mongoose = require('mongoose');

async function validateCharge(val) {
  const ExpenseCategory = mongoose.model('ExpenseCategory');
  try {
    const expenseCategory = await ExpenseCategory.findById(val).lean().exec();
    return Boolean(expenseCategory);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateCharge,
};
