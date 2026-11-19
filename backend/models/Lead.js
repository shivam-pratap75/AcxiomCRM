
const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },

    phone: {
      type: String,
      required: true,
      trim: true
    },

    source: {
      type: String,
      enum: ['Website', 'Referral', 'Social Media', 'Advertisement', 'Other'],
      default: 'Other'
    },

    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'],
      default: 'New'
    },

    expectedValue: {
      type: Number,
      min: 0,
      default: 0
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    notes: {
      type: String,
      trim: true
    },

    convertedCustomer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Lead', leadSchema);
