const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

// Импорт маршрутов
const authRoutes = require('./routes/auth');
const profileRoutes = require('./routes/profile');

// Инициализация приложения
const app = express();

// Конфигурация порта
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Маршрут для проверки работы API
app.get('/', (req, res) => {
  res.json({ message: 'TatCon API работает!' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Ошибка сервера',
    error: process.env.NODE_ENV === 'production' ? undefined : err.message
  });
});

// Подключение к MongoDB и запуск сервера
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tatcon')
  .then(() => {
    console.log('MongoDB подключена');
    app.listen(PORT, () => {
      console.log(`Сервер запущен на порту ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
  });

// Обработка неперехваченных исключений
process.on('unhandledRejection', (err) => {
  console.log('НЕПЕРЕХВАЧЕННАЯ ОШИБКА! Завершение работы...');
  console.error(err);
  process.exit(1);
}); 