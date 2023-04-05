const mongoose = require('mongoose');
const { validateUser } = require('../user/validate');

const bvnSchema = new mongoose.Schema({
  bvn: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    sparse: true,
    validate: validateUser,
  },
  first_name: {
    type: String,
  },
  last_name: {
    type: String,
    index: true,
  },
  middle_name: {
    type: String,
  },
  email: {
    type: String,
  },
  phone_number1: {
    type: String,
  },
  date_of_birth: {
    type: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('BVN', bvnSchema);