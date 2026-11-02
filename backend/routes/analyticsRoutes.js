const express = require('express');
const router = express.Router();
const {
  getFinancialSummary,
  getMonthlyTrends,
  getCategoryBreakdown,
  getWeeklySpending,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/summary', getFinancialSummary);
router.get('/monthly', getMonthlyTrends);
router.get('/categories', getCategoryBreakdown);
router.get('/weekly', getWeeklySpending);

module.exports = router;
