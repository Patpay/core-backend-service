const mongoose = require('mongoose');

async function validateExpenseCategory(val) {
  const ExpenseCategory = mongoose.model('ExpenseCategory');
  try {
    const expenseCategory = await ExpenseCategory.findById(val).lean().exec();
    return Boolean(expenseCategory);
  } catch (ex) {
    return false;
  }
}

module.exports = {
  validateExpenseCategory,
};
