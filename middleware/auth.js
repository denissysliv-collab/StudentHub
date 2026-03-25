/**
 * Middleware для проверки JWT токена
 * Проверяет наличие и валидность токена в заголовке Authorization
 */

const jwt = require('jsonwebtoken');
const config = require('../config');

/**
 * Извлекает токен из заголовка Authorization
 * @param {string} authHeader - Заголовок Authorization
 * @returns {string|null}
 */
function extractToken(authHeader) {
  if (!authHeader) return null;
  
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }
  
  return parts[1];
}

/**
 * Middleware для защиты маршрутов
 * Добавляет объект пользователя в req.user
 */
const authenticateToken = (req, res, next) => {
  const token = extractToken(req.headers.authorization);

  if (!token) {
    return res.status(401).json({ 
      error: 'Требуется токен аутентификации',
      code: 'TOKEN_REQUIRED'
    });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ 
          error: 'Срок действия токена истёк',
          code: 'TOKEN_EXPIRED'
        });
      }
      return res.status(403).json({ 
        error: 'Недействительный токен',
        code: 'TOKEN_INVALID'
      });
    }
    
    req.user = user;
    next();
  });
};

/**
 * Опциональная аутентификация
 * Если токен есть - проверяет и добавляет пользователя, если нет - продолжает без ошибки
 */
const optionalAuth = (req, res, next) => {
  const token = extractToken(req.headers.authorization);

  if (token) {
    jwt.verify(token, config.jwt.secret, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  
  next();
};

/**
 * Middleware для проверки роли пользователя
 * @param  {...string} roles - Разрешённые роли
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        error: 'Требуется аутентификация',
        code: 'UNAUTHORIZED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Недостаточно прав для выполнения этого действия',
        code: 'FORBIDDEN'
      });
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  extractToken,
};
