/**
 * Product Controller
 * Обработчики запросов товаров
 */

const { productService } = require('../services');
const { validateQuery } = require('../middleware/validation');

/**
 * Получение списка товаров
 * GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const {
      search = '',
      category = 'all',
      brand = '',
      minPrice = 0,
      maxPrice = Number.MAX_SAFE_INTEGER,
      sortBy = 'default',
      page = 1,
      limit = 20,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const result = await productService.getProducts({
      search,
      category,
      brand,
      minPrice: parseFloat(minPrice),
      maxPrice: parseFloat(maxPrice),
      sortBy,
      limit: parseInt(limit),
      offset,
    });

    res.json({
      data: result.products,
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
 * Получение товара по ID
 * GET /api/products/:id
 */
const getProduct = async (req, res) => {
  try {
    const product = await productService.getProduct(parseInt(req.params.id));
    res.json({ product });
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Получение популярных товаров
 * GET /api/products/featured
 */
const getFeaturedProducts = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8;
    const products = await productService.getFeaturedProducts(limit);
    res.json({ products });
  } catch (error) {
    throw error;
  }
};

/**
 * Получение категорий
 * GET /api/categories
 */
const getCategories = async (req, res) => {
  try {
    const { categoryRepository } = require('../repositories');
    const categories = await categoryRepository.findAll();
    res.json({ categories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Ошибка получения категорий', code: 'INTERNAL_ERROR' });
  }
};

/**
 * Лайк товара
 * POST /api/products/:id/like
 */
const toggleLike = async (req, res) => {
  try {
    const result = await productService.toggleLike(
      parseInt(req.params.id),
      req.user.id
    );
    res.json(result);
  } catch (error) {
    if (error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

module.exports = {
  getProducts,
  getProduct,
  getFeaturedProducts,
  getCategories,
  toggleLike,
};
