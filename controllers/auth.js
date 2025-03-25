const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

// @desc    Регистрация пользователя через Email
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, photo } = req.body;

    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ 
        success: false, 
        message: 'Пользователь с таким email уже существует' 
      });
    }

    // Создание пользователя
    user = await User.create({
      name,
      email,
      password,
      photo,
      authProvider: 'email'
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при регистрации пользователя',
      error: err.message
    });
  }
};

// @desc    Вход через Email
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Проверка наличия email и пароля
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Пожалуйста, укажите email и пароль'
      });
    }

    // Поиск пользователя
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные'
      });
    }

    // Проверка совпадения пароля
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Неверные учетные данные'
      });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при входе в систему',
      error: err.message
    });
  }
};

// @desc    Google OAuth аутентификация
// @route   POST /api/auth/google
// @access  Public
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;
    
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    
    const payload = ticket.getPayload();
    const { email, name, picture, sub } = payload;
    
    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    
    if (user) {
      // Если пользователь существует, обновляем providerId
      if (user.authProvider !== 'google') {
        user.authProvider = 'google';
        user.providerId = sub;
        await user.save();
      }
    } else {
      // Создание нового пользователя
      user = await User.create({
        name,
        email,
        photo: picture,
        authProvider: 'google',
        providerId: sub
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при Google-аутентификации',
      error: err.message
    });
  }
};

// @desc    Facebook OAuth аутентификация
// @route   POST /api/auth/facebook
// @access  Public
exports.facebookAuth = async (req, res) => {
  try {
    const { accessToken, userID } = req.body;
    
    // Получаем данные пользователя из Facebook
    const url = `https://graph.facebook.com/v13.0/${userID}?fields=id,name,email,picture&access_token=${accessToken}`;
    const response = await axios.get(url);
    const { id, name, email, picture } = response.data;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email не предоставлен из Facebook'
      });
    }
    
    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    
    if (user) {
      // Если пользователь существует, обновляем providerId
      if (user.authProvider !== 'facebook') {
        user.authProvider = 'facebook';
        user.providerId = id;
        await user.save();
      }
    } else {
      // Создание нового пользователя
      user = await User.create({
        name,
        email,
        photo: picture.data.url,
        authProvider: 'facebook',
        providerId: id
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при Facebook-аутентификации',
      error: err.message
    });
  }
};

// @desc    VK OAuth аутентификация
// @route   POST /api/auth/vk
// @access  Public
exports.vkAuth = async (req, res) => {
  try {
    const { code } = req.body;
    
    // Получаем access token
    const tokenUrl = `https://oauth.vk.com/access_token?client_id=${process.env.VK_CLIENT_ID}&client_secret=${process.env.VK_CLIENT_SECRET}&redirect_uri=${process.env.VK_REDIRECT_URI}&code=${code}`;
    const tokenResponse = await axios.get(tokenUrl);
    const { access_token, user_id, email } = tokenResponse.data;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email не предоставлен из VK'
      });
    }
    
    // Получаем данные пользователя
    const userUrl = `https://api.vk.com/method/users.get?user_ids=${user_id}&fields=photo_200&access_token=${access_token}&v=5.131`;
    const userResponse = await axios.get(userUrl);
    const userData = userResponse.data.response[0];
    const name = `${userData.first_name} ${userData.last_name}`;
    const photo = userData.photo_200;
    
    // Проверка, существует ли пользователь
    let user = await User.findOne({ email });
    
    if (user) {
      // Если пользователь существует, обновляем providerId
      if (user.authProvider !== 'vk') {
        user.authProvider = 'vk';
        user.providerId = user_id.toString();
        await user.save();
      }
    } else {
      // Создание нового пользователя
      user = await User.create({
        name,
        email,
        photo,
        authProvider: 'vk',
        providerId: user_id.toString()
      });
    }
    
    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при VK-аутентификации',
      error: err.message
    });
  }
};

// @desc    Получение текущего пользователя
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Ошибка при получении данных пользователя',
      error: err.message
    });
  }
};

// Создание и отправка токена в cookie
const sendTokenResponse = (user, statusCode, res) => {
  // Создание токена
  const token = user.getSignedJwtToken();
  
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true
  };
  
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }
  
  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token
    });
}; 