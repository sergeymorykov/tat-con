const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Защита маршрутов
exports.protect = async (req, res, next) => {
  let token;
  
  // Проверяем header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Получаем токен из header
    token = req.headers.authorization.split(' ')[1];
  } 
  // Проверяем cookie
  else if (req.cookies.token) {
    token = req.cookies.token;
  }
  
  // Проверяем наличие токена
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Нет доступа к этому ресурсу'
    });
  }
  
  try {
    // Верификация токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ищем пользователя по id из токена
    req.user = await User.findById(decoded.id);
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }
    
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Нет доступа к этому ресурсу'
    });
  }
}; 