/**
 * Product Routes
 */

const express = require('express');
const router = express.Router();
const { authenticateToken, optionalAuth } = require('../middleware/auth');
const ProductController = require('../controllers/ProductController');

// GET /api/products/featured (должен быть перед /:id)
router.get('/featured', ProductController.getFeaturedProducts);

// GET /api/products
router.get('/', ProductController.getProducts);

// GET /api/products/:id
router.get('/:id', ProductController.getProduct);

// POST /api/products/:id/like (защищено)
router.post('/:id/like', authenticateToken, ProductController.toggleLike);

module.exports = router;
