const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    mobile: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: String,
      sparse: true,
    },
    token: {
      type: String,
    },
    status: {
      type: String,
      default: 'INACTIVE',
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    },
  },
  { strict: 'throw', timestamps: true },
);

const User = mongoose.model('User', userSchema);
module.exports = {
  User,
};
