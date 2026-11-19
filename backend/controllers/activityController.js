
const Activity = require('../models/Activity');
const Lead = require('../models/Lead');
const Customer = require('../models/Customer');

const activityTypes = ['Call', 'Meeting', 'Email', 'Task'];
const activityStatuses = ['Planned', 'Completed', 'Cancelled'];

// GET activities
exports.getActivities = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role === 'Sales Executive') {
      filter.assignedTo = req.user._id;
    }

    if (req.query.type) filter.type = req.query.type;
    if (req.query.status) filter.status = req.query.status;

    const activities = await Activity.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name')
      .populate('lead', 'name email')
      .populate('customer', 'name email')
      .sort({ activityDate: -1 });

    res.status(200).json({
      success: true,
      count: activities.length,
      activities
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// CREATE activity
exports.createActivity = async (req, res) => {
  try {
    const {
      subject,
      type,
      description,
      activityDate,
      relatedTo,
      lead,
      customer
    } = req.body;

    if (!subject || !type || !activityDate || !relatedTo) {
      return res.status(400).json({
        success: false,
        message: 'Subject, type, date and related record are required.'
      });
    }

    if (!activityTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity type.'
      });
    }

    const date = new Date(activityDate);

    if (Number.isNaN(date.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid activity date.'
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
        message: 'You cannot create an activity for this record.'
      });
    }

    const activity = await Activity.create({
      subject,
      type,
      description,
      activityDate: date,
      relatedTo,
      lead: relatedTo === 'Lead' ? lead : null,
      customer: relatedTo === 'Customer' ? customer : null,
      assignedTo: relatedRecord.assignedTo,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Activity created successfully.',
      activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// UPDATE activity
exports.updateActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      activity.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot update this activity.'
      });
    }

    const { subject, type, description, activityDate, status } = req.body;

    if (subject !== undefined) activity.subject = subject;
    if (description !== undefined) activity.description = description;

    if (type !== undefined) {
      if (!activityTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity type.'
        });
      }
      activity.type = type;
    }

    if (status !== undefined) {
      if (!activityStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity status.'
        });
      }
      activity.status = status;
    }

    if (activityDate !== undefined) {
      const date = new Date(activityDate);

      if (Number.isNaN(date.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid activity date.'
        });
      }

      activity.activityDate = date;
    }

    await activity.save();

    res.status(200).json({
      success: true,
      message: 'Activity updated successfully.',
      activity
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE activity
exports.deleteActivity = async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({
        success: false,
        message: 'Activity not found.'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      activity.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'You cannot delete this activity.'
      });
    }

    await activity.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Activity deleted successfully.'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
