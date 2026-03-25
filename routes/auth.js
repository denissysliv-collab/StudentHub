/**
 * Auth Routes
 */

const express = require('express');
const router = express.Router();
const { validate } = require('../middleware/validation');
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const AuthController = require('../controllers/AuthController');

// Валидационные схемы (можно вынести в отдельный файл)
const registerSchema = {
  username: { type: 'string', minLength: 3, maxLength: 30, pattern: /^[a-zA-Z0-9_]+$/ },
  email: { type: 'string', format: 'email' },
  password: { type: 'string', minLength: 6, maxLength: 100 },
};

const loginSchema = {
  username: { type: 'string', required: true },
  password: { type: 'string', required: true },
};

// Простая валидация
function validateBody(schema) {
  return (req, res, next) => {
    const errors = [];
    
    for (const [field, rules] of Object.entries(schema)) {
      const value = req.body[field];
      
      if (rules.required && !value) {
        errors.push({ field, message: `Поле "${field}" обязательно` });
        continue;
      }
      
      if (value === undefined && !rules.required) continue;
      
      if (rules.type === 'string' && typeof value !== 'string') {
        errors.push({ field, message: `Поле "${field}" должно быть строкой` });
        continue;
      }
      
      if (rules.minLength && value.length < rules.minLength) {
        errors.push({ field, message: `Поле "${field}" должно быть не менее ${rules.minLength} символов` });
      }
      
      if (rules.maxLength && value.length > rules.maxLength) {
        errors.push({ field, message: `Поле "${field}" должно быть не более ${rules.maxLength} символов` });
      }
      
      if (rules.pattern && !rules.pattern.test(value)) {
        errors.push({ field, message: `Поле "${field}" имеет неверный формат` });
      }
    }
    
    if (errors.length > 0) {
      return res.status(400).json({
        error: 'Ошибка валидации',
        code: 'VALIDATION_ERROR',
        details: errors,
      });
    }
    
    next();
  };
}

// POST /api/auth/register
router.post('/register', validateBody(registerSchema), AuthController.register);

// POST /api/auth/login
router.post('/login', validateBody(loginSchema), AuthController.login);

// GET /api/auth/me (защищено)
router.get('/me', authenticateToken, AuthController.getMe);

// PUT /api/auth/profile (защищено)
router.put('/profile', authenticateToken, AuthController.updateProfile);

module.exports = router;
