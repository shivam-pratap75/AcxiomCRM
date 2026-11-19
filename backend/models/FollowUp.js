
const mongoose = require('mongoose');

const followUpSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },

    followUpDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ['Planned', 'Completed', 'Cancelled'],
      default: 'Planned'
    },

    relatedTo: {
      type: String,
      enum: ['Lead', 'Customer'],
      required: true
    },

    lead: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Lead',
      default: null
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      default: null
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
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('FollowUp', followUpSchema);
