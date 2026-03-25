/**
 * Question Service
 * Бизнес-логика вопросов и ответов
 */

const { questionRepository, answerRepository, tagRepository } = require('../repositories');

class QuestionService {
  /**
   * Создание вопроса
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async createQuestion({ userId, title, content, productId, tags = [] }) {
    const config = require('../config');

    if (!title || title.trim().length === 0) {
      const error = new Error('Заголовок вопроса обязателен');
      error.code = 'EMPTY_TITLE';
      throw error;
    }

    if (title.length > config.limits.maxTitleLength) {
      const error = new Error(`Заголовок не должен превышать ${config.limits.maxTitleLength} символов`);
      error.code = 'TITLE_TOO_LONG';
      throw error;
    }

    if (!content || content.trim().length === 0) {
      const error = new Error('Содержание вопроса обязательно');
      error.code = 'EMPTY_CONTENT';
      throw error;
    }

    // Создаём вопрос
    const question = await questionRepository.create({
      userId,
      title: title.trim(),
      content: content.trim(),
      productId,
    });

    // Добавляем теги
    if (tags.length > 0) {
      // TODO: Добавить TagRepository и логику тегов
    }

    return await questionRepository.findById(question.id);
  }

  /**
   * Получение вопроса по ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getQuestion(id) {
    const question = await questionRepository.findById(id);
    
    if (!question) {
      const error = new Error('Вопрос не найден');
      error.code = 'QUESTION_NOT_FOUND';
      throw error;
    }

    // Увеличиваем счётчик просмотров
    await questionRepository.incrementViews(id);

    // Получаем теги и ответы
    question.tags = await questionRepository.getQuestionTags(id);
    question.answers = await answerRepository.findByQuestion(id);

    return question;
  }

  /**
   * Получение списка вопросов
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getQuestions(options = {}) {
    return await questionRepository.findAll(options);
  }

  /**
   * Добавление ответа
   * @param {number} questionId 
   * @param {number} userId 
   * @param {string} content 
   * @returns {Promise<Object>}
   */
  async addAnswer(questionId, userId, content) {
    const config = require('../config');

    if (!content || content.trim().length === 0) {
      const error = new Error('Содержание ответа обязательно');
      error.code = 'EMPTY_CONTENT';
      throw error;
    }

    if (content.length > config.limits.maxCommentLength) {
      const error = new Error(`Ответ не должен превышать ${config.limits.maxCommentLength} символов`);
      error.code = 'ANSWER_TOO_LONG';
      throw error;
    }

    // Проверяем существование вопроса
    const question = await questionRepository.findById(questionId);
    if (!question) {
      const error = new Error('Вопрос не найден');
      error.code = 'QUESTION_NOT_FOUND';
      throw error;
    }

    const answer = await answerRepository.create({
      questionId,
      userId,
      content: content.trim(),
    });

    return await answerRepository.findById(answer.id);
  }

  /**
   * Принятие ответа
   * @param {number} answerId 
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async acceptAnswer(answerId, userId) {
    const answer = await answerRepository.findById(answerId);
    
    if (!answer) {
      const error = new Error('Ответ не найден');
      error.code = 'ANSWER_NOT_FOUND';
      throw error;
    }

    // Проверяем, что пользователь - автор вопроса
    const question = await questionRepository.findById(answer.question_id);
    if (question.user_id !== userId) {
      const error = new Error('Только автор вопроса может принять ответ');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await answerRepository.acceptAnswer(answerId, question.id);
  }

  /**
   * Удаление вопроса
   * @param {number} questionId 
   * @param {number} userId 
   * @param {boolean} isAdmin 
   * @returns {Promise<boolean>}
   */
  async deleteQuestion(questionId, userId, isAdmin = false) {
    const question = await questionRepository.findById(questionId);
    
    if (!question) {
      const error = new Error('Вопрос не найден');
      error.code = 'QUESTION_NOT_FOUND';
      throw error;
    }

    if (question.user_id !== userId && !isAdmin) {
      const error = new Error('Вы можете удалять только свои вопросы');
      error.code = 'FORBIDDEN';
      throw error;
    }

    return await questionRepository.delete(questionId);
  }
}

module.exports = new QuestionService();
