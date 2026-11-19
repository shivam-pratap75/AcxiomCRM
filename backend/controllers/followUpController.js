
const FollowUp = require('../models/FollowUp');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');
const User = require('../models/User');

// Get follow-ups
exports.getFollowUps = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'Sales Executive') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const followUps = await FollowUp.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('lead', 'name email')
      .populate('customer', 'name email')
      .sort({ followUpDate: 1 });

    res.status(200).json({
      success: true,
      count: followUps.length,
      followUps
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Create follow-up
exports.createFollowUp = async (req, res) => {
  try {
    const {
      title,
      description,
      followUpDate,
      relatedTo,
      lead,
      customer,
      assignedTo
    } = req.body;

    if (!title || !followUpDate || !relatedTo) {
      return res.status(400).json({
        success: false,
        message: 'Title, date and related record are required.'
      });
    }

    const date = new Date(followUpDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid follow-up date.'
      });
    }

    // Compare calendar dates, not just the current time
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      return res.status(400).json({
        success: false,
        message: 'Follow-up date cannot be earlier than today.'
      });
    }

    if (!['Lead', 'Customer'].includes(relatedTo)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid related record type.'
      });
    }

    let relatedRecord;

    if (relatedTo === 'Lead') {
      if (!lead) {
        return res.status(400).json({
          success: false,
          message: 'Please select a lead.'
        });
      }

      relatedRecord = await Lead.findById(lead);
    } else {
      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Please select a customer.'
        });
      }

      relatedRecord = await Customer.findById(customer);
    }

    if (!relatedRecord) {
      return res.status(404).json({
        success: false,
        message: 'Related record not found.'
      });
    }

    // Sales Executives can only create follow-ups for their records
    if (
      req.user.role === 'Sales Executive' &&
      relatedRecord.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot create a follow-up for this record.'
      });
    }

    let assignedUser = relatedRecord.assignedTo;

    if (['Admin', 'Manager'].includes(req.user.role) && assignedTo) {
      const executive = await User.findOne({
        _id: assignedTo,
        role: 'Sales Executive'
      });

      if (!executive) {
        return res.status(400).json({
          success: false,
          message: 'Invalid Sales Executive.'
        });
      }

      assignedUser = executive._id;
    }

    const followUp = await FollowUp.create({
      title,
      description,
      followUpDate: date,
      relatedTo,
      lead: relatedTo === 'Lead' ? lead : null,
      customer: relatedTo === 'Customer' ? customer : null,
      assignedTo: assignedUser,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Follow-up created successfully.',
      followUp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Update follow-up
exports.updateFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      followUp.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this follow-up.'
      });
    }

    const { title, description, followUpDate, status } = req.body;

    if (title !== undefined) followUp.title = title;
    if (description !== undefined) followUp.description = description;

    if (followUpDate !== undefined) {
      const date = new Date(followUpDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid follow-up date.'
        });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);

      if (followUp.status === 'Planned' && selectedDate < today) {
        return res.status(400).json({
          success: false,
          message: 'A planned follow-up cannot be scheduled in the past.'
        });
      }

      followUp.followUpDate = date;
    }

    if (status !== undefined) {
      if (!['Planned', 'Completed', 'Cancelled'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid follow-up status.'
        });
      }

      followUp.status = status;
    }

    await followUp.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up updated successfully.',
      followUp
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Delete follow-up
exports.deleteFollowUp = async (req, res) => {
  try {
    const followUp = await FollowUp.findById(req.params.id);

    if (!followUp) {
      return res.status(404).json({
        success: false,
        message: 'Follow-up not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      followUp.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this follow-up.'
      });
    }

    await followUp.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Follow-up deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
