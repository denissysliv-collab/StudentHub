/**
 * StudentHub API Server
 * 
 * Архитектура:
 * - Express.js сервер
 * - Слои: routes -> controllers -> services -> repositories
 * - SQLite база данных
 * - JWT аутентификация
 */

const express = require('express');
const cors = require('cors');
const path = require('path');

const config = require('./config');
const { initDatabase, closeDb } = require('./database');
const apiRoutes = require('./routes');

const app = express();

// ============================================
// Middleware
// ============================================

// CORS
app.use(cors(config.cors));

// Parse JSON
app.use(express.json({ limit: '10mb' }));

// Parse URL-encoded
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (в development)
if (config.isDevelopment) {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// ============================================
// API Routes
// ============================================

app.use('/api', apiRoutes);

// ============================================
// Static files (для frontend)
// ============================================

// Раздаём статические файлы из корня проекта
app.use(express.static(path.join(__dirname)));

// Редирект с корня на feed.html
app.get('/', (req, res) => {
  res.redirect('/feed.html');
});

// ============================================
// Error Handling
// ============================================

// 404 - Not Found
app.use((req, res) => {
  res.status(404).json({
    error: 'Ресурс не найден',
    code: 'NOT_FOUND',
    path: req.path,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);

  // Обработка ошибок валидации Joi
  if (err.isJoi) {
    return res.status(400).json({
      error: 'Ошибка валидации данных',
      code: 'VALIDATION_ERROR',
      details: err.details,
    });
  }

  // Обработка ошибок JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Недействительный токен',
      code: 'TOKEN_INVALID',
    });
  }

  // По умолчанию - 500 Internal Server Error
  res.status(500).json({
    error: config.isDevelopment ? err.message : 'Внутренняя ошибка сервера',
    code: 'INTERNAL_ERROR',
    ...(config.isDevelopment && { stack: err.stack }),
  });
});

// ============================================
// Graceful Shutdown
// ============================================

const gracefulShutdown = async (signal) => {
  console.log(`\n🛑 Получен сигнал ${signal}. Завершение работы...`);
  
  await closeDb();
  
  console.log('✅ Работа сервера завершена');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Обработка незахваченных ошибок
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection:', reason);
  gracefulShutdown('unhandledRejection');
});

// ============================================
// Start Server
// ============================================

const startServer = async () => {
  try {
    // Инициализация базы данных
    await initDatabase();

    // Запуск сервера
    app.listen(config.port, config.host, () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 StudentHub API Server                                ║
║                                                           ║
║   URL: http://${config.host}:${config.port.toString().padEnd(5)}                          ║
║   Environment: ${config.isDevelopment ? 'Development' : config.isProduction ? 'Production' : 'Test'}                              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
