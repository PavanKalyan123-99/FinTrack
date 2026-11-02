const express = require('express');
const router = express.Router();
const {
  getMonthlyReport,
  exportTransactionsCSV,
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/monthly', getMonthlyReport);
router.get('/export', exportTransactionsCSV);

module.exports = router;
