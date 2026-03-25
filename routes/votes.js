/**
 * Vote Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const VoteController = require('../controllers/VoteController');

// POST /api/votes (защищено)
router.post('/', authenticateToken, VoteController.vote);

// GET /api/votes/:votableType/:votableId (защищено)
router.get('/:votableType/:votableId', authenticateToken, VoteController.getUserVote);

module.exports = router;
