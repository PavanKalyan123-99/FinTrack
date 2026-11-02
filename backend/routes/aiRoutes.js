const express = require('express');
const router = express.Router();
const {
  getAIInsights,
  askAIAdvisor,
  getHealthScore,
} = require('../controllers/aiController');
const { protect } = require('../middleware/auth');
const { aiLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.get('/insights', getAIInsights);
router.post('/ask', aiLimiter, askAIAdvisor);
router.get('/health-score', getHealthScore);

module.exports = router;
