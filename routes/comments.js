/**
 * Comment Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const CommentController = require('../controllers/CommentController');

// GET /api/comments/:parentType/:parentId
router.get('/:parentType/:parentId', CommentController.getComments);

// POST /api/comments/:parentType/:parentId (защищено)
router.post('/:parentType/:parentId', authenticateToken, CommentController.addComment);

// PUT /api/comments/:id (защищено)
router.put('/:id', authenticateToken, CommentController.updateComment);

// DELETE /api/comments/:id (защищено)
router.delete('/:id', authenticateToken, CommentController.deleteComment);

module.exports = router;
