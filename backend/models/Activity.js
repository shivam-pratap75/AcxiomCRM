
const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
      trim: true
    },

    type: {
      type: String,
      enum: ['Call', 'Meeting', 'Email', 'Task'],
      required: true
    },

    description: {
      type: String,
      trim: true
    },

    activityDate: {
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

module.exports = mongoose.model('Activity', activitySchema);
