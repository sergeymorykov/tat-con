const User = require('../models/User');

// @desc    Обновление профиля пользователя
// @route   PUT /api/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      photo: req.body.photo,
      interests: req.body.interests,
      description: req.body.description,
      meetingGoal: req.body.meetingGoal,
      isNewUser: req.body.isNewUser !== undefined ? req.body.isNewUser : undefined
    };

    // Удаляем неопределенные поля
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    // Обновляем пользователя
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при обновлении профиля',
      error: err.message
    });
  }
};

// @desc    Получение профиля пользователя
// @route   GET /api/profile/:id
// @access  Public
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении профиля',
      error: err.message
    });
  }
};

// @desc    Добавление рейтинга пользователю
// @route   POST /api/profile/:id/rating
// @access  Private
exports.addRating = async (req, res) => {
  try {
    const { rating } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Рейтинг должен быть от 1 до 5'
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    // Обновляем рейтинг
    const newRatingCount = user.ratingCount + 1;
    const newRating = ((user.rating * user.ratingCount) + rating) / newRatingCount;

    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        rating: newRating,
        ratingCount: newRatingCount
      },
      { new: true }
    );

    res.status(200).json({
      success: true,
      data: updatedUser
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при добавлении рейтинга',
      error: err.message
    });
  }
}; 