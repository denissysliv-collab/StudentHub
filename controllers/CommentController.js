/**
 * Comment Controller
 * Обработчики запросов комментариев
 */

const { commentService } = require('../services');

/**
 * Получение комментариев
 * GET /api/comments/:parentType/:parentId
 */
const getComments = async (req, res) => {
  try {
    const { parentType, parentId } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const result = await commentService.getComments(
      parentType,
      parseInt(parentId),
      {
        limit: parseInt(limit),
        offset: parseInt(offset),
      }
    );

    res.json(result);
  } catch (error) {
    throw error;
  }
};

/**
 * Добавление комментария
 * POST /api/comments/:parentType/:parentId
 */
const addComment = async (req, res) => {
  try {
    const { parentType, parentId } = req.params;
    const { content } = req.body;

    const comment = await commentService.addComment({
      userId: req.user.id,
      parentType,
      parentId: parseInt(parentId),
      content,
    });

    res.status(201).json({ comment });
  } catch (error) {
    if (['EMPTY_COMMENT', 'COMMENT_TOO_LONG'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Обновление комментария
 * PUT /api/comments/:id
 */
const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await commentService.updateComment(
      parseInt(req.params.id),
      req.user.id,
      content
    );
    res.json({ comment });
  } catch (error) {
    if (['COMMENT_NOT_FOUND', 'FORBIDDEN'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Удаление комментария
 * DELETE /api/comments/:id
 */
const deleteComment = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin' || req.user.role === 'moderator';
    await commentService.deleteComment(parseInt(req.params.id), req.user.id, isAdmin);
    res.json({ message: 'Комментарий удалён' });
  } catch (error) {
    if (['COMMENT_NOT_FOUND', 'FORBIDDEN'].includes(error.code)) {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

module.exports = {
  getComments,
  addComment,
  updateComment,
  deleteComment,
};
