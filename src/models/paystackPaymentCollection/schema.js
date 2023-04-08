const mongoose = require('mongoose');

const paystackPaymentCollectionSchema = new mongoose.Schema(
  {
    paymentId: {
      type: Number,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
    },
    message: {
      type: String,
    },
    gateway_response: {
      type: String,
    },
    amount: {
      type: Number,
    },
    currency: {
      type: String,
    },
    status: {
      type: String,
    },
    event: {
      type: String,
    },
    paid_at: {
      type: Date,
    },
    fees: {
      type: Number,
    },
    authorization: {
      authorization_code: {
        type: String,
      },
      bin: {
        type: String,
      },
      last4: {
        type: String,
      },
      exp_month: {
        type: String,
      },
      channel: {
        type: String,
      },
      card_type: {
        type: String,
      },
      bank: {
        type: String,
      },
      country_code: {
        type: String,
      },
      brand: {
        type: String,
      },
      reusable: {
        type: Boolean,
      },
      signature: {
        type: String,
      },
      account_name: {
        type: String,
      },
      receiver_bank_account_number: {
        type: String,
      },
      receiver_bank: {
        type: String,
      },
    },
    paidAt: {
      type: Date,
    },
    source: {
      type: {
        type: String,
      },
      source: {
        type: String,
      },
      entry_point: {
        type: String,
      },
      identifier: {
        type: String,
      },
    },
    channel: {
      type: String,
    },
    reference: {
      type: String,
    },
    created_at: {
      type: Date,
    },
  },
  { strict: 'throw', timestamps: true },
);

module.exports = mongoose.model('PaystackPaymentCollection', paystackPaymentCollectionSchema);