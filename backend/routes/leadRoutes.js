
const express = require('express');
const router = express.Router();

const {
  getLeads,
  createLead,
  updateLead,
  deleteLead,
  convertLead
} = require('../controllers/leadController');

const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeads);
router.post('/', createLead);
router.put('/:id', updateLead);
router.delete('/:id', deleteLead);
router.post('/:id/convert', convertLead);

module.exports = router;
