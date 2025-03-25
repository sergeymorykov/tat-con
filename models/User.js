const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Пожалуйста, укажите имя'],
    trim: true,
    maxlength: [50, 'Имя не может быть длиннее 50 символов']
  },
  email: {
    type: String,
    required: [true, 'Пожалуйста, укажите email'],
    unique: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Пожалуйста, укажите корректный email'
    ]
  },
  photo: {
    type: String,
    required: [true, 'Фото профиля обязательно']
  },
  interests: {
    type: [String],
    default: []
  },
  description: {
    type: String,
    default: ''
  },
  meetingGoal: {
    type: String,
    default: ''
  },
  isNewUser: {
    type: Boolean,
    default: true
  },
  rating: {
    type: Number,
    default: 0
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  authProvider: {
    type: String,
    enum: ['google', 'facebook', 'vk', 'email'],
    required: true
  },
  providerId: {
    type: String
  },
  password: {
    type: String,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Хэширование пароля перед сохранением (только для аутентификации через email)
UserSchema.pre('save', async function(next) {
  if (this.authProvider === 'email' && this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Метод для создания JWT токена
UserSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Метод для проверки пароля
UserSchema.methods.matchPassword = async function(enteredPassword) {
  if (this.authProvider !== 'email') return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema); 