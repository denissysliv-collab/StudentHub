/**
 * API Routes
 * Подключение всех маршрутов API
 */

const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const productRoutes = require('./products');
const commentRoutes = require('./comments');
const voteRoutes = require('./votes');
const questionRoutes = require('./questions');
const ProductController = require('../controllers/ProductController');

// Подключаем маршруты
router.use('/auth', authRoutes);

// Категории (должен быть перед /products)
router.get('/categories', (req, res) => {
  console.log('GET /categories hit');
  ProductController.getCategories(req, res);
});

router.use('/products', productRoutes);
router.use('/comments', commentRoutes);
router.use('/votes', voteRoutes);
router.use('/questions', questionRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
