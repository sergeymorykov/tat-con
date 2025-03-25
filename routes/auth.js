const express = require('express');
const {
  register,
  login,
  googleAuth,
  facebookAuth,
  vkAuth,
  getMe
} = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Маршруты
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/facebook', facebookAuth);
router.post('/vk', vkAuth);
router.get('/me', protect, getMe);

module.exports = router; 