
const Customer = require('../models/Customer');
const User = require('../models/User');

// Get customers based on logged-in user's role
const getCustomers = async (req, res) => {
  try {
    const filter = {};

    // Sales Executives can only see their assigned customers
    if (req.user.role === 'Sales Executive') {
      filter.assignedTo = req.user._id;
    }

    // Search by name, email or phone
    if (req.query.search) {
      const search = req.query.search.trim();

      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by status
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const customers = await Customer.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      count: customers.length,
      customers
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch customers'
    });
  }
};

// Create customer
const createCustomer = async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      address,
      status,
      assignedTo,
      notes
    } = req.body;

    if (!name || !email || !phone) {
      return res.status(400).json({
        message: 'Name, email and phone are required'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();

    const duplicate = await Customer.findOne({
      $or: [
        { email: normalizedEmail },
        { phone: normalizedPhone }
      ]
    });

    if (duplicate) {
      return res.status(409).json({
        message: 'A customer with this email or phone already exists'
      });
    }

    // Sales Executives can assign customers only to themselves
    let finalAssignedTo = req.user._id;

    if (req.user.role !== 'Sales Executive' && assignedTo) {
      const salesUser = await User.findOne({
        _id: assignedTo,
        role: 'Sales Executive'
      });

      if (!salesUser) {
        return res.status(400).json({
          message: 'Assigned user must be a Sales Executive'
        });
      }

      finalAssignedTo = salesUser._id;
    }

    const customer = await Customer.create({
      name,
      email: normalizedEmail,
      phone: normalizedPhone,
      address,
      status,
      assignedTo: finalAssignedTo,
      notes,
      createdBy: req.user._id
    });

    const result = await customer.populate('assignedTo', 'name email');

    res.status(201).json({
      message: 'Customer created successfully',
      customer: result
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email or phone already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to create customer'
    });
  }
};

// Update customer
const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    // Sales Executives can update only their assigned customers
    if (
      req.user.role === 'Sales Executive' &&
      customer.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'You cannot update this customer'
      });
    }

    const allowedFields = [
      'name',
      'email',
      'phone',
      'address',
      'status',
      'notes'
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        customer[field] =
          typeof req.body[field] === 'string'
            ? req.body[field].trim()
            : req.body[field];
      }
    });

    if (customer.email) {
      customer.email = customer.email.toLowerCase();
    }

    // Only Admin and Manager can reassign customers
    if (
      req.user.role !== 'Sales Executive' &&
      req.body.assignedTo
    ) {
      const salesUser = await User.findOne({
        _id: req.body.assignedTo,
        role: 'Sales Executive'
      });

      if (!salesUser) {
        return res.status(400).json({
          message: 'Assigned user must be a Sales Executive'
        });
      }

      customer.assignedTo = salesUser._id;
    }

    await customer.save();

    await customer.populate('assignedTo', 'name email');

    res.status(200).json({
      message: 'Customer updated successfully',
      customer
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email or phone already exists'
      });
    }

    res.status(500).json({
      message: 'Failed to update customer'
    });
  }
};

// Delete customer
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        message: 'Customer not found'
      });
    }

    if (
      req.user.role === 'Sales Executive' &&
      customer.assignedTo.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        message: 'You cannot delete this customer'
      });
    }

    await customer.deleteOne();

    res.status(200).json({
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete customer'
    });
  }
};

module.exports = {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
};
