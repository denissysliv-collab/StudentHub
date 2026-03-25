/**
 * Question Controller
 * Обработчики запросов вопросов и ответов
 */

const { questionService } = require('../services');

/**
 * Получение списка вопросов
 * GET /api/questions
 */
const getQuestions = async (req, res) => {
  try {
    const {
      search = '',
      productId = '',
      tags = '',
      sortBy = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await questionService.getQuestions({
      search,
      productId: productId ? parseInt(productId) : null,
      tags: tags ? tags.split(',') : [],
      sortBy,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: result.questions,
      pagination: {
        total: result.total,
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: result.hasMore,
      },
    });
  } catch (error) {
    throw error;
  }
};

/**
 * Получение вопроса по ID
 * GET /api/questions/:id
 */
const getQuestion = async (req, res) => {
  try {
    const question = await questionService.getQuestion(parseInt(req.params.id));
    res.json({ question });
  } catch (error) {
    if (error.code === 'QUESTION_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Создание вопроса
 * POST /api/questions
 */
const createQuestion = async (req, res) => {
  try {
    const { title, content, productId, tags } = req.body;

    const question = await questionService.createQuestion({
      userId: req.user.id,
      title,
      content,
      productId,
      tags,
    });

    res.status(201).json({
      message: 'Вопрос успешно создан',
      question,
    });
  } catch (error) {
    if (['EMPTY_TITLE', 'TITLE_TOO_LONG', 'EMPTY_CONTENT'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Добавление ответа
 * POST /api/questions/:id/answers
 */
const addAnswer = async (req, res) => {
  try {
    const { content } = req.body;

    const answer = await questionService.addAnswer(
      parseInt(req.params.id),
      req.user.id,
      content
    );

    res.status(201).json({
      message: 'Ответ успешно добавлен',
      answer,
    });
  } catch (error) {
    if (['EMPTY_CONTENT', 'ANSWER_TOO_LONG', 'QUESTION_NOT_FOUND'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Принятие ответа
 * POST /api/answers/:id/accept
 */
const acceptAnswer = async (req, res) => {
  try {
    const answer = await questionService.acceptAnswer(
      parseInt(req.params.id),
      req.user.id
    );
    res.json({
      message: 'Ответ принят',
      answer,
    });
  } catch (error) {
    if (['ANSWER_NOT_FOUND', 'FORBIDDEN'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Удаление вопроса
 * DELETE /api/questions/:id
 */
const deleteQuestion = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    await questionService.deleteQuestion(parseInt(req.params.id), req.user.id, isAdmin);
    res.json({ message: 'Вопрос удалён' });
  } catch (error) {
    if (['QUESTION_NOT_FOUND', 'FORBIDDEN'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

module.exports = {
  getQuestions,
  getQuestion,
  createQuestion,
  addAnswer,
  acceptAnswer,
  deleteQuestion,
};
