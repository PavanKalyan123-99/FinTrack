const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getMe,
  updatePassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter } = require('../middleware/rateLimiter');

router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;
