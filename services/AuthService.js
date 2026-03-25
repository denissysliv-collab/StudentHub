/**
 * Auth Service
 * Бизнес-логика аутентификации и регистрации
 */

const jwt = require('jsonwebtoken');
const config = require('../config');
const { userRepository } = require('../repositories');

class AuthService {
  /**
   * Регистрация нового пользователя
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async register({ username, email, password }) {
    // Проверяем существование пользователя
    const existingUser = await userRepository.findByUsername(username);
    if (existingUser) {
      const error = new Error('Пользователь с таким именем уже существует');
      error.code = 'USER_EXISTS';
      throw error;
    }

    const existingEmail = await userRepository.findByEmail(email);
    if (existingEmail) {
      const error = new Error('Пользователь с таким email уже существует');
      error.code = 'EMAIL_EXISTS';
      throw error;
    }

    // Создаём пользователя
    const user = await userRepository.create({ username, email, password });

    // Генерируем токен
    const token = this.generateToken(user);

    return {
      user,
      token,
    };
  }

  /**
   * Вход пользователя
   * @param {string} username 
   * @param {string} password 
   * @returns {Promise<Object>}
   */
  async login(username, password) {
    const user = await userRepository.findByUsername(username);
    
    if (!user) {
      const error = new Error('Неверные учетные данные');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const isValid = await userRepository.verifyPassword(password, user.password_hash);
    
    if (!isValid) {
      const error = new Error('Неверные учетные данные');
      error.code = 'INVALID_CREDENTIALS';
      throw error;
    }

    const token = this.generateToken({
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
      token,
    };
  }

  /**
   * Генерация JWT токена
   * @param {Object} payload 
   * @returns {string}
   */
  generateToken(payload) {
    return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn });
  }

  /**
   * Получение профиля пользователя
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async getProfile(userId) {
    const user = await userRepository.findById(userId);
    
    if (!user) {
      const error = new Error('Пользователь не найден');
      error.code = 'USER_NOT_FOUND';
      throw error;
    }

    return user;
  }

  /**
   * Обновление профиля
   * @param {number} userId 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async updateProfile(userId, { avatarUrl, bio }) {
    const user = await userRepository.update(userId, { avatarUrl, bio });
    return user;
  }
}

module.exports = new AuthService();
