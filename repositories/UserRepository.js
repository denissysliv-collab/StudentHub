/**
 * User Repository
 * Работает с таблицей users
 */

const { getDb } = require('../database');
const bcrypt = require('bcrypt');
const config = require('../config');

class UserRepository {
  /**
   * Создание нового пользователя
   * @param {Object} data - Данные пользователя
   * @returns {Promise<Object>}
   */
  async create({ username, email, password }) {
    const db = await getDb();
    const passwordHash = await bcrypt.hash(password, config.bcrypt.saltRounds);

    const result = await db.run(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    return {
      id: result.lastID,
      username,
      email,
    };
  }

  /**
   * Поиск пользователя по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(
      'SELECT id, username, email, avatar_url, bio, role, is_active, created_at FROM users WHERE id = ?',
      [id]
    );
  }

  /**
   * Поиск пользователя по username
   * @param {string} username 
   * @returns {Promise<Object|null>}
   */
  async findByUsername(username) {
    const db = await getDb();
    return await db.get(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );
  }

  /**
   * Поиск пользователя по email
   * @param {string} email 
   * @returns {Promise<Object|null>}
   */
  async findByEmail(email) {
    const db = await getDb();
    return await db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
  }

  /**
   * Проверка пароля
   * @param {string} password 
   * @param {string} passwordHash 
   * @returns {Promise<boolean>}
   */
  async verifyPassword(password, passwordHash) {
    return await bcrypt.compare(password, passwordHash);
  }

  /**
   * Обновление данных пользователя
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, { avatarUrl, bio }) {
    const db = await getDb();
    
    await db.run(
      `UPDATE users 
       SET avatar_url = COALESCE(?, avatar_url), 
           bio = COALESCE(?, bio),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [avatarUrl, bio, id]
    );

    return this.findById(id);
  }

  /**
   * Получение списка пользователей (с пагинацией)
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async findAll({ limit = 20, offset = 0 } = {}) {
    const db = await getDb();
    return await db.all(
      `SELECT id, username, email, avatar_url, role, created_at 
       FROM users 
       ORDER BY created_at DESC 
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
  }

  /**
   * Удаление пользователя
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
    return result.changes > 0;
  }
}

module.exports = new UserRepository();
