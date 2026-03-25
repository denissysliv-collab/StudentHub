/**
 * Answer Repository
 * Работает с таблицей answers
 */

const { getDb } = require('../database');

class AnswerRepository {
  /**
   * Создание ответа
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create({ questionId, userId, content }) {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO answers (question_id, user_id, content) VALUES (?, ?, ?)',
      [questionId, userId, content]
    );
    return { id: result.lastID, question_id: questionId, user_id: userId, content };
  }

  /**
   * Поиск ответа по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT 
        a.*,
        u.username as author
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);
  }

  /**
   * Получение ответов на вопрос
   * @param {number} questionId 
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async findByQuestion(questionId, { limit = 50, offset = 0, sortBy = 'oldest' } = {}) {
    const db = await getDb();

    let order = 'a.created_at ASC';
    if (sortBy === 'votes') {
      order = 'a.votes_count DESC, a.created_at ASC';
    } else if (sortBy === 'newest') {
      order = 'a.created_at DESC';
    }

    return await db.all(`
      SELECT 
        a.*,
        u.username as author,
        u.avatar_url
      FROM answers a
      JOIN users u ON a.user_id = u.id
      WHERE a.question_id = ?
      ORDER BY a.is_accepted DESC, ${order}
      LIMIT ? OFFSET ?
    `, [questionId, limit, offset]);
  }

  /**
   * Обновление ответа
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const db = await getDb();
    const fields = [];
    const values = [];

    const allowedFields = ['content', 'is_accepted'];
    
    for (const [key, value] of Object.entries(data)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(`UPDATE answers SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  /**
   * Удаление ответа
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM answers WHERE id = ?', [id]);
    return true;
  }

  /**
   * Принятие ответа как правильного
   * @param {number} answerId 
   * @param {number} questionId 
   * @returns {Promise<Object>}
   */
  async acceptAnswer(answerId, questionId) {
    const db = await getDb();
    
    // Снимаем принятие со всех ответов
    await db.run('UPDATE answers SET is_accepted = 0 WHERE question_id = ?', [questionId]);
    
    // Принимаем текущий ответ
    await db.run('UPDATE answers SET is_accepted = 1 WHERE id = ?', [answerId]);
    
    // Помечаем вопрос как решённый
    await db.run('UPDATE questions SET is_resolved = 1 WHERE id = ?', [questionId]);
    
    return this.findById(answerId);
  }
}

module.exports = new AnswerRepository();
