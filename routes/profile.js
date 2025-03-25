const express = require('express');
const {
  updateProfile,
  getProfile,
  addRating
} = require('../controllers/profile');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Маршруты
router.put('/', protect, updateProfile);
router.get('/:id', getProfile);
router.post('/:id/rating', protect, addRating);

module.exports = router; 