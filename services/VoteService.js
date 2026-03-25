/**
 * Vote Service
 * Бизнес-логика голосования
 */

const { voteRepository, questionRepository, answerRepository } = require('../repositories');

class VoteService {
  /**
   * Голосование за вопрос или ответ
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async vote({ userId, votableType, votableId, voteType }) {
    // Проверяем существование объекта
    let exists = false;
    if (votableType === 'question') {
      exists = await questionRepository.findById(votableId);
    } else if (votableType === 'answer') {
      exists = await answerRepository.findById(votableId);
    }

    if (!exists) {
      const error = new Error('Объект для голосования не найден');
      error.code = 'VOTABLE_NOT_FOUND';
      throw error;
    }

    // Создаём или обновляем голос
    const result = await voteRepository.upsert({
      userId,
      votableType,
      votableId,
      voteType,
    });

    // Получаем текущее количество голосов
    const voteCount = await voteRepository.getVoteCount(votableType, votableId);

    return {
      action: result.action,
      ...voteCount,
    };
  }

  /**
   * Получение голоса пользователя
   * @param {number} userId 
   * @param {string} votableType 
   * @param {number} votableId 
   * @returns {Promise<Object>}
   */
  async getUserVote(userId, votableType, votableId) {
    return await voteRepository.getUserVote(userId, votableType, votableId);
  }
}

module.exports = new VoteService();
