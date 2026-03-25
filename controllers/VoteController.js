/**
 * Vote Controller
 * Обработчики запросов голосования
 */

const { voteService } = require('../services');

/**
 * Голосование
 * POST /api/votes
 */
const vote = async (req, res) => {
  try {
    const { votableType, votableId, voteType } = req.body;

    const result = await voteService.vote({
      userId: req.user.id,
      votableType,
      votableId: parseInt(votableId),
      voteType,
    });

    res.json(result);
  } catch (error) {
    if (['VOTABLE_NOT_FOUND'].includes(error.code)) {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Получение голоса пользователя
 * GET /api/votes/:votableType/:votableId
 */
const getUserVote = async (req, res) => {
  try {
    const { votableType, votableId } = req.params;
    const vote = await voteService.getUserVote(
      req.user.id,
      votableType,
      parseInt(votableId)
    );
    res.json({ vote });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  vote,
  getUserVote,
};
