/**
 * Middleware для валидации запросов
 * Использует библиотеку Joi для валидации данных
 */

const config = require('../config');

/**
 * Форматирует ошибки валидации
 * @param {Array} errors - Массив ошибок Joi
 * @returns {Object}
 */
function formatValidationErrors(errors) {
  return errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
  }));
}

/**
 * Middleware для валидации запроса
 * @param {Object} schema - Joi схема валидации
 */
const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { 
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Ошибка валидации данных',
        code: 'VALIDATION_ERROR',
        details: formatValidationErrors(error.details),
      });
    }

    // Заменяем req.body на валидированные данные
    req.body = value;
    next();
  };
};

/**
 * Валидация query параметров
 * @param {Object} schema - Joi схема валидации
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, { 
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Ошибка валидации параметров',
        code: 'VALIDATION_ERROR',
        details: formatValidationErrors(error.details),
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Валидация URL параметров
 * @param {Object} schema - Joi схема валидации
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, { 
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      return res.status(400).json({
        error: 'Ошибка валидации параметров URL',
        code: 'VALIDATION_ERROR',
        details: formatValidationErrors(error.details),
      });
    }

    req.params = value;
    next();
  };
};

/**
 * Лимит длины текста
 * @param {string} field - Поле для проверки
 * @param {number} maxLength - Максимальная длина
 */
const limitTextLength = (field, maxLength) => {
  return (req, res, next) => {
    const text = req.body[field];
    
    if (text && text.length > maxLength) {
      return res.status(400).json({
        error: `Поле "${field}" не должно превышать ${maxLength} символов`,
        code: 'TEXT_TOO_LONG',
      });
    }
    
    next();
  };
};

module.exports = {
  validate,
  validateQuery,
  validateParams,
  limitTextLength,
  formatValidationErrors,
};
