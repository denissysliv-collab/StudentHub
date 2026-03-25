/**
 * Comment Service
 * Бизнес-логика работы с комментариями
 */

const { commentRepository } = require('../repositories');

class CommentService {
  /**
   * Добавление комментария
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async addComment({ userId, parentType, parentId, content }) {
    if (!content || content.trim().length === 0) {
      const error = new Error('Комментарий не может быть пустым');
      error.code = 'EMPTY_COMMENT';
      throw error;
    }

    const config = require('../config');
    if (content.length > config.limits.maxCommentLength) {
      const error = new Error(`Комментарий не должен превышать ${config.limits.maxCommentLength} символов`);
      error.code = 'COMMENT_TOO_LONG';
      throw error;
    }

    const comment = await commentRepository.create({
      userId,
      parentType,
      parentId,
      content: content.trim(),
    });

    // Добавляем данные пользователя
    const fullComment = await commentRepository.findById(comment.id);
    return fullComment;
  }

  /**
   * Получение комментариев для объекта
   * @param {string} parentType 
   * @param {number} parentId 
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getComments(parentType, parentId, options = {}) {
    const comments = await commentRepository.findByParent(parentType, parentId, options);
    
    // Для каждого комментария получаем ответы
    for (const comment of comments) {
      if (comment.replies_count > 0) {
        comment.replies = await commentRepository.findReplies(comment.id);
      }
    }

    const total = await commentRepository.countByParent(parentType, parentId);

    return {
      comments,
      total,
    };
  }

  /**
   * Обновление комментария
   * @param {number} commentId 
   * @param {number} userId 
   * @param {string} content 
   * @returns {Promise<Object>}
   */
  async updateComment(commentId, userId, content) {
    const comment = await commentRepository.findById(commentId);
    
    if (!comment) {
      const error = new Error('Комментарий не найден');
      error.code = 'COMMENT_NOT_FOUND';
      throw error;
    }

    if (comment.user_id !== userId) {
      const error = new Error('Вы можете редактировать только свои комментарии');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await commentRepository.update(commentId, content);
  }

  /**
   * Удаление комментария
   * @param {number} commentId 
   * @param {number} userId 
   * @param {boolean} isAdmin 
   * @returns {Promise<boolean>}
   */
  async deleteComment(commentId, userId, isAdmin = false) {
    const comment = await commentRepository.findById(commentId);
    
    if (!comment) {
      const error = new Error('Комментарий не найден');
      error.code = 'COMMENT_NOT_FOUND';
      throw error;
    }

    if (comment.user_id !== userId && !isAdmin) {
      const error = new Error('Вы можете удалять только свои комментарии');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await commentRepository.delete(commentId);
  }
}

module.exports = new CommentService();
