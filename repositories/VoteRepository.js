/**
 * Vote Repository
 * Работает с таблицей votes
 */

const { getDb } = require('../database');

class VoteRepository {
  /**
   * Создание или обновление голоса
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async upsert({ userId, votableType, votableId, voteType }) {
    const db = await getDb();

    // Проверяем существующий голос
    const existing = await db.get(
      'SELECT * FROM votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
      [userId, votableType, votableId]
    );

    if (existing) {
      // Обновляем существующий
      if (existing.vote_type === voteType) {
        // Если тот же голос - удаляем (отмена голоса)
        await db.run(
          'DELETE FROM votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
          [userId, votableType, votableId]
        );
        return { action: 'removed' };
      } else {
        // Меняем голос
        await db.run(
          'UPDATE votes SET vote_type = ? WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
          [voteType, userId, votableType, votableId]
        );
        return { action: 'updated' };
      }
    } else {
      // Создаём новый
      await db.run(
        'INSERT INTO votes (user_id, votable_type, votable_id, vote_type) VALUES (?, ?, ?, ?)',
        [userId, votableType, votableId, voteType]
      );
      return { action: 'created' };
    }
  }

  /**
   * Получение голоса пользователя
   * @param {number} userId 
   * @param {string} votableType 
   * @param {number} votableId 
   * @returns {Promise<Object|null>}
   */
  async getUserVote(userId, votableType, votableId) {
    const db = await getDb();
    return await db.get(
      'SELECT vote_type FROM votes WHERE user_id = ? AND votable_type = ? AND votable_id = ?',
      [userId, votableType, votableId]
    );
  }

  /**
   * Получение количества голосов для объекта
   * @param {string} votableType 
   * @param {number} votableId 
   * @returns {Promise<Object>}
   */
  async getVoteCount(votableType, votableId) {
    const db = await getDb();
    const result = await db.get(`
      SELECT 
        SUM(CASE WHEN vote_type = 'upvote' THEN 1 ELSE 0 END) as upvotes,
        SUM(CASE WHEN vote_type = 'downvote' THEN 1 ELSE 0 END) as downvotes
      FROM votes
      WHERE votable_type = ? AND votable_id = ?
    `, [votableType, votableId]);

    return {
      upvotes: result?.upvotes || 0,
      downvotes: result?.downvotes || 0,
      score: (result?.upvotes || 0) - (result?.downvotes || 0),
    };
  }
}

module.exports = new VoteRepository();
