/**
 * Question Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const QuestionController = require('../controllers/QuestionController');

// GET /api/questions
router.get('/', optionalAuth, QuestionController.getQuestions);

// GET /api/questions/:id
router.get('/:id', optionalAuth, QuestionController.getQuestion);

// POST /api/questions (защищено)
router.post('/', authenticateToken, QuestionController.createQuestion);

// POST /api/questions/:id/answers (защищено)
router.post('/:id/answers', authenticateToken, QuestionController.addAnswer);

// POST /api/answers/:id/accept (защищено)
router.post('/answers/:id/accept', authenticateToken, QuestionController.acceptAnswer);

// DELETE /api/questions/:id (защищено)
router.delete('/:id', authenticateToken, QuestionController.deleteQuestion);

module.exports = router;
