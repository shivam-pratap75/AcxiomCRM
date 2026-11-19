
const express = require('express');
const router = express.Router();

const {
  protect,
  authorize
} = require('../middleware/authMiddleware');

// Any logged-in user
router.get('/profile', protect, (req, res) => {
  res.status(200).json({
    message: 'Profile fetched successfully',
    user: req.user
  });
});

// Only Admin can access
router.get('/admin-test', protect, authorize('Admin'), (req, res) => {
  res.status(200).json({
    message: 'Welcome Admin!'
  });
});

// Admin and Manager can access
router.get(
  '/manager-test',
  protect,
  authorize('Admin', 'Manager'),
  (req, res) => {
    res.status(200).json({
      message: 'Welcome Admin/Manager!'
    });
  }
);

module.exports = router;
