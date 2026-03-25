/**
 * Product Service
 * Бизнес-логика работы с товарами
 */

const { productRepository, categoryRepository, voteRepository } = require('../repositories');

class ProductService {
  /**
   * Получение списка товаров с фильтрами
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async getProducts(options = {}) {
    return await productRepository.findAll(options);
  }

  /**
   * Получение товара по ID
   * @param {number} id 
   * @returns {Promise<Object>}
   */
  async getProduct(id) {
    const product = await productRepository.findById(id);
    
    if (!product) {
      const error = new Error('Товар не найден');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Увеличиваем счётчик просмотров
    await productRepository.incrementViews(id);

    // Получаем изображения и характеристики
    product.images = await productRepository.getImages(id);
    
    return product;
  }

  /**
   * Получение товара по slug
   * @param {string} slug 
   * @returns {Promise<Object>}
   */
  async getProductBySlug(slug) {
    const product = await productRepository.findBySlug(slug);
    
    if (!product) {
      const error = new Error('Товар не найден');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    product.images = await productRepository.getImages(product.id);
    product.features = await productRepository.getFeatures(product.id);

    return product;
  }

  /**
   * Получение популярных товаров
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getFeaturedProducts(limit = 8) {
    return await productRepository.getFeatured(limit);
  }

  /**
   * Лайк товара
   * @param {number} productId 
   * @param {number} userId 
   * @returns {Promise<Object>}
   */
  async toggleLike(productId, userId) {
    const product = await productRepository.findById(productId);
    
    if (!product) {
      const error = new Error('Товар не найден');
      error.code = 'PRODUCT_NOT_FOUND';
      throw error;
    }

    // Проверяем, лайкнул ли уже пользователь
    const db = require('../database').getDb();
    const existing = await (await db).get(
      'SELECT * FROM favorites WHERE user_id = ? AND product_id = ?',
      [userId, productId]
    );

    if (existing) {
      // Удаляем лайк
      await (await db).run('DELETE FROM favorites WHERE user_id = ? AND product_id = ?', [userId, productId]);
      await productRepository.decrementLikes(productId);
      return { liked: false, count: product.likes_count - 1 };
    } else {
      // Добавляем лайк
      await (await db).run(
        'INSERT INTO favorites (user_id, product_id) VALUES (?, ?)',
        [userId, productId]
      );
      // likes_count обновится триггером
      const updated = await productRepository.findById(productId);
      return { liked: true, count: updated.likes_count };
    }
  }

  /**
   * Получение категорий
   * @returns {Promise<Array>}
   */
  async getCategories() {
    return await categoryRepository.findAll();
  }
}

module.exports = new ProductService();
