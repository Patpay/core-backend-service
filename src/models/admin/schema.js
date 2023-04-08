const mongoose = require('mongoose');
const { validateRole } = require('../role/validate');

const adminSchema = new mongoose.Schema(
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
      index: {
        unique: true,
      },
    },
    mobile: {
      type: String,
      required: true,
      index: {
        unique: true,
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
      validate: validateRole,
    },
    status: {
      type: String,
      default: 'ACTIVE',
      enum: ['ACTIVE', 'INACTIVE', 'TERMINATED'],
    },
  },

  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('Admin', adminSchema);
