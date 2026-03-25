/**
 * Конфигурация приложения
 * Хранит настройки для разных окружений
 */

const path = require('path');

module.exports = {
  // Сервер
  port: process.env.PORT || 3000,
  host: process.env.HOST || 'localhost',
  
  // База данных
  database: {
    filename: process.env.DB_PATH || path.join(__dirname, '..', 'studenthub.db'),
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // BCrypt
  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10,
  },
  
  // CORS
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  
  // Лимиты
  limits: {
    maxPageSize: 100,
    defaultPageSize: 20,
    maxCommentLength: 2000,
    maxTitleLength: 200,
  },
  
  // Пути
  paths: {
    root: path.join(__dirname, '..'),
    uploads: path.join(__dirname, '..', 'uploads'),
  },
  
  // Окружение
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
};
