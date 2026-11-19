
const express = require('express');
const router = express.Router();

const {
  getCustomers,
  createCustomer,
  updateCustomer,
  deleteCustomer
} = require('../controllers/customerController');

const { protect } = require('../middleware/authMiddleware');

// All customer routes require authentication
router.use(protect);

router.get('/', getCustomers);
router.post('/', createCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

module.exports = router;
