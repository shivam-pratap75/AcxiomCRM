
const mongoose = require('mongoose');

const opportunitySchema = new mongoose.Schema(
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

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    probability: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 10
    },

    expectedCloseDate: {
      type: Date,
      required: true
    },

    stage: {
      type: String,
      enum: [
        'Prospecting',
        'Qualification',
        'Proposal',
        'Negotiation',
        'Won',
        'Lost'
      ],
      default: 'Prospecting'
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

module.exports = mongoose.model('Opportunity', opportunitySchema);

