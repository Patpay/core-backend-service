const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
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
    activated: {
      type: Boolean,
      required: true,
      default: false,
    },
    status: {
      type: String,
      default: 'INACTIVE',
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    },
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
