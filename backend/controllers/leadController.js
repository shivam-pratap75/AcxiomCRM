
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

// GET all leads
exports.getLeads = async (req, res) => {
  try {
    const filter = {};

    // Sales Executives can see only their assigned leads
    if (req.user.role === 'Sales Executive') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');

      filter.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex }
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('convertedCustomer', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CREATE a lead
exports.createLead = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      source,
      expectedValue,
      assignedTo,
      notes
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and phone are required.'
      });
    }

    let assignedUser = req.user._id;

    // Admin and Manager can assign leads to Sales Executives
    if (
      ['Admin', 'Manager'].includes(req.user.role) &&
      assignedTo
    ) {
      const salesExecutive = await User.findOne({
        _id: assignedTo,
        role: 'Sales Executive'
      });

      if (!salesExecutive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Sales Executive.'
        });
      }

      assignedUser = salesExecutive._id;
    }

    const lead = await Lead.create({
      name,
      email,
      phone,
      source,
      expectedValue,
      assignedTo: assignedUser,
      createdBy: req.user._id,
      notes
    });

    res.status(201).json({
      success: true,
      message: 'Lead created successfully.',
      lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// UPDATE a lead
exports.updateLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this lead.'
      });
    }

    const allowedFields = [
      'name',
      'email',
      'phone',
      'source',
      'status',
      'expectedValue',
      'notes'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        lead[field] = req.body[field];
      }
    });

    if (
      ['Admin', 'Manager'].includes(req.user.role) &&
      req.body.assignedTo
    ) {
      const salesExecutive = await User.findOne({
        _id: req.body.assignedTo,
        role: 'Sales Executive'
      });

      if (!salesExecutive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Sales Executive.'
        });
      }

      lead.assignedTo = salesExecutive._id;
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead updated successfully.',
      lead
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// DELETE a lead
exports.deleteLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this lead.'
      });
    }

    await lead.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Lead deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// CONVERT lead into customer
exports.convertLead = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      lead.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot convert this lead.'
      });
    }

    if (lead.status === 'Converted') {
      return res.status(400).json({
        success: false,
        message: 'This lead has already been converted.'
      });
    }

    const existingCustomer = await Customer.findOne({
      $or: [
        { email: lead.email },
        { phone: lead.phone }
      ]
    });

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: 'A customer with this email or phone already exists.'
      });
    }

    const customer = await Customer.create({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      assignedTo: lead.assignedTo,
      createdBy: req.user._id,
      notes: lead.notes
    });

    lead.status = 'Converted';
    lead.convertedCustomer = customer._id;

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead converted into customer successfully.',
      customer
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
