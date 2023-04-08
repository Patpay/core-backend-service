const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  description: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: true,
  },
}, { strict: 'throw', timestamps: true });


module.exports = mongoose.model('Role', roleSchema);