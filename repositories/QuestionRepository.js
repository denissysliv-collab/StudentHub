/**
 * Question Repository
 * Работает с таблицами questions, question_tags
 */

const { getDb } = require('../database');

class QuestionRepository {
  /**
   * Создание вопроса
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create({ userId, title, content, productId = null }) {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO questions (user_id, product_id, title, content) VALUES (?, ?, ?, ?)',
      [userId, productId, title, content]
    );
    return { id: result.lastID, user_id: userId, product_id: productId, title, content };
  }

  /**
   * Поиск вопроса по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT 
        q.*,
        u.username as author,
        p.name as product_name,
        p.slug as product_slug
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN products p ON q.product_id = p.id
      WHERE q.id = ?
    `, [id]);
  }

  /**
   * Получение списка вопросов с пагинацией
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async findAll({
    search = '',
    productId = null,
    userId = null,
    tags = [],
    sortBy = 'newest',
    limit = 20,
    offset = 0,
  } = {}) {
    const db = await getDb();

    let query = `
      SELECT 
        q.*,
        u.username as author,
        p.name as product_name
      FROM questions q
      JOIN users u ON q.user_id = u.id
      LEFT JOIN products p ON q.product_id = p.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      query += ` AND (q.title LIKE ? OR q.content LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (productId) {
      query += ` AND q.product_id = ?`;
      params.push(productId);
    }

    if (userId) {
      query += ` AND q.user_id = ?`;
      params.push(userId);
    }

    // Сортировка
    switch (sortBy) {
      case 'newest':
        query += ' ORDER BY q.created_at DESC';
        break;
      case 'oldest':
        query += ' ORDER BY q.created_at ASC';
        break;
      case 'most-answered':
        query += ' ORDER BY q.answers_count DESC';
        break;
      case 'most-votes':
        query += ' ORDER BY q.votes_count DESC';
        break;
      case 'most-viewed':
        query += ' ORDER BY q.views_count DESC';
        break;
      default:
        query += ' ORDER BY q.is_pinned DESC, q.created_at DESC';
    }

    // Общее количество
    const countQuery = query.replace('SELECT q.*, u.username as author, p.name as product_name', 'SELECT COUNT(*) as total');
    const { total } = await db.get(countQuery, params);

    // Пагинация
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const questions = await db.all(query, params);

    // Получаем теги для каждого вопроса
    for (const question of questions) {
      question.tags = await this.getQuestionTags(question.id);
    }

    return {
      questions,
      total,
      limit,
      offset,
      hasMore: offset + questions.length < total,
    };
  }

  /**
   * Обновление вопроса
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const db = await getDb();
    const fields = [];
    const values = [];

    const allowedFields = ['title', 'content', 'is_resolved', 'is_pinned'];
    
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

    await db.run(`UPDATE questions SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }

  /**
   * Увеличение счётчика просмотров
   * @param {number} id 
   */
  async incrementViews(id) {
    const db = await getDb();
    await db.run('UPDATE questions SET views_count = views_count + 1 WHERE id = ?', [id]);
  }

  /**
   * Удаление вопроса
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    await db.run('DELETE FROM questions WHERE id = ?', [id]);
    return true;
  }

  /**
   * Добавление тега к вопросу
   * @param {number} questionId 
   * @param {number} tagId 
   */
  async addTag(questionId, tagId) {
    const db = await getDb();
    await db.run(
      'INSERT OR IGNORE INTO question_tags (question_id, tag_id) VALUES (?, ?)',
      [questionId, tagId]
    );
  }

  /**
   * Получение тегов вопроса
   * @param {number} questionId 
   * @returns {Promise<Array>}
   */
  async getQuestionTags(questionId) {
    const db = await getDb();
    const tags = await db.all(
      'SELECT t.id, t.name, t.slug FROM tags t JOIN question_tags qt ON t.id = qt.tag_id WHERE qt.question_id = ?',
      [questionId]
    );
    return tags;
  }

  /**
   * Удаление всех тегов вопроса
   * @param {number} questionId 
   */
  async clearTags(questionId) {
    const db = await getDb();
    await db.run('DELETE FROM question_tags WHERE question_id = ?', [questionId]);
  }
}

module.exports = new QuestionRepository();
