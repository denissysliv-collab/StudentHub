/**
 * Comment Repository
 * Работает с таблицей comments
 */

const { getDb } = require('../database');

class CommentRepository {
  /**
   * Создание комментария
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create({ userId, parentType, parentId, content, parentCommentId = null }) {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO comments (user_id, parent_type, parent_id, content, parent_comment_id) VALUES (?, ?, ?, ?, ?)',
      [userId, parentType, parentId, content, parentCommentId]
    );

    return {
      id: result.lastID,
      user_id: userId,
      parent_type: parentType,
      parent_id: parentId,
      content,
      parent_comment_id: parentCommentId,
    };
  }

  /**
   * Получение комментариев для объекта
   * @param {string} parentType - 'product', 'question', 'answer'
   * @param {number} parentId 
   * @param {Object} options 
   * @returns {Promise<Array>}
   */
  async findByParent(parentType, parentId, { limit = 50, offset = 0 } = {}) {
    const db = await getDb();
    return await db.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        c.is_deleted,
        u.id as user_id,
        u.username,
        u.avatar_url,
        (SELECT COUNT(*) FROM comments WHERE parent_comment_id = c.id) as replies_count
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_type = ? AND c.parent_id = ? AND c.parent_comment_id IS NULL AND c.is_deleted = 0
      ORDER BY c.created_at DESC
      LIMIT ? OFFSET ?
    `, [parentType, parentId, limit, offset]);
  }

  /**
   * Получение ответов на комментарий
   * @param {number} parentCommentId 
   * @returns {Promise<Array>}
   */
  async findReplies(parentCommentId) {
    const db = await getDb();
    return await db.all(`
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as user_id,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = ? AND c.is_deleted = 0
      ORDER BY c.created_at ASC
    `, [parentCommentId]);
  }

  /**
   * Поиск комментария по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT 
        c.*,
        u.id as user_id,
        u.username,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `, [id]);
  }

  /**
   * Обновление комментария
   * @param {number} id 
   * @param {string} content 
   * @returns {Promise<Object>}
   */
  async update(id, content) {
    const db = await getDb();
    await db.run(
      'UPDATE comments SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [content, id]
    );
    return this.findById(id);
  }

  /**
   * Удаление комментария (мягкое)
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    await db.run('UPDATE comments SET is_deleted = 1 WHERE id = ?', [id]);
    return true;
  }

  /**
   * Получение количества комментариев для объекта
   * @param {string} parentType 
   * @param {number} parentId 
   * @returns {Promise<number>}
   */
  async countByParent(parentType, parentId) {
    const db = await getDb();
    const { total } = await db.get(
      'SELECT COUNT(*) as total FROM comments WHERE parent_type = ? AND parent_id = ? AND is_deleted = 0',
      [parentType, parentId]
    );
    return total || 0;
  }
}

module.exports = new CommentRepository();
