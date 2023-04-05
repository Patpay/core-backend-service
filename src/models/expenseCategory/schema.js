const mongoose = require('mongoose');

const expenseCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: true,
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);
