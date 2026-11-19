
const Opportunity = require('../models/Opportunity');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

const stages = [
  'Prospecting',
  'Qualification',
  'Proposal',
  'Negotiation',
  'Won',
  'Lost'
];

const validateCloseDate = (value) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(date);
  selected.setHours(0, 0, 0, 0);

  return selected >= today ? date : null;
};

// GET opportunities
exports.getOpportunities = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'Sales Executive') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.stage) filter.stage = req.query.stage;

    if (req.query.search) {
      const regex = new RegExp(req.query.search, 'i');
      filter.title = regex;
    }

    const opportunities = await Opportunity.find(filter)
      .populate('assignedTo', 'name email')
      .populate('lead', 'name email')
      .populate('customer', 'name email')
      .sort({ expectedCloseDate: 1 });

    res.status(200).json({
      success: true,
      count: opportunities.length,
      opportunities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE opportunity
exports.createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      amount,
      probability,
      expectedCloseDate,
      stage,
      relatedTo,
      lead,
      customer
    } = req.body;

    if (!title || amount === undefined || !expectedCloseDate || !relatedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title, amount, closing date and related record are required.'
      });
    }

    const numericAmount = Number(amount);
    const numericProbability = Number(probability ?? 10);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Opportunity amount must be greater than zero.'
      });
    }

    if (
      !Number.isFinite(numericProbability) ||
      numericProbability < 0 ||
      numericProbability > 100
    ) {
      return res.status(400).json({
        success: false,
        message: 'Probability must be between 0 and 100.'
      });
    }

    const closeDate = validateCloseDate(expectedCloseDate);

    if (!closeDate) {
      return res.status(400).json({
        success: false,
        message: 'Expected closing date cannot be in the past.'
      });
    }

    if (!stages.includes(stage || 'Prospecting')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid opportunity stage.'
      });
    }

    let relatedRecord;

    if (relatedTo === 'Lead' && lead) {
      relatedRecord = await Lead.findById(lead);
    } else if (relatedTo === 'Customer' && customer) {
      relatedRecord = await Customer.findById(customer);
    } else {
      return res.status(400).json({
        success: false,
        message: 'Select a valid lead or customer.'
      });
    }

    if (!relatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Related record not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      relatedRecord.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create an opportunity for this record.'
      });
    }

    let assignedTo = relatedRecord.assignedTo;

    if (['Admin', 'Manager'].includes(req.user.role) && req.body.assignedTo) {
      const executive = await User.findOne({
        _id: req.body.assignedTo,
        role: 'Sales Executive'
      });

      if (!executive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Sales Executive.'
        });
      }

      assignedTo = executive._id;
    }

    const opportunity = await Opportunity.create({
      title,
      description,
      amount: numericAmount,
      probability: numericProbability,
      expectedCloseDate: closeDate,
      stage: stage || 'Prospecting',
      relatedTo,
      lead: relatedTo === 'Lead' ? lead : null,
      customer: relatedTo === 'Customer' ? customer : null,
      assignedTo,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Opportunity created successfully.',
      opportunity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE opportunity
exports.updateOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      opportunity.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this opportunity.'
      });
    }

    const { title, description, amount, probability, expectedCloseDate, stage } = req.body;

    if (title !== undefined) opportunity.title = title;
    if (description !== undefined) opportunity.description = description;

    if (amount !== undefined) {
      if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Opportunity amount must be greater than zero.'
        });
      }
      opportunity.amount = Number(amount);
    }

    if (probability !== undefined) {
      if (
        !Number.isFinite(Number(probability)) ||
        Number(probability) < 0 ||
        Number(probability) > 100
      ) {
        return res.status(400).json({
          success: false,
          message: 'Probability must be between 0 and 100.'
        });
      }
      opportunity.probability = Number(probability);
    }

    if (expectedCloseDate !== undefined) {
      const date = validateCloseDate(expectedCloseDate);

      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Expected closing date cannot be in the past.'
        });
      }

      opportunity.expectedCloseDate = date;
    }

    if (stage !== undefined) {
      if (!stages.includes(stage)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid opportunity stage.'
        });
      }
      opportunity.stage = stage;
    }

    await opportunity.save();

    res.status(200).json({
      success: true,
      message: 'Opportunity updated successfully.',
      opportunity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE opportunity
exports.deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({
        success: false,
        message: 'Opportunity not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      opportunity.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this opportunity.'
      });
    }

    await opportunity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Opportunity deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
    