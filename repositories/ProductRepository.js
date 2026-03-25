/**
 * Product Repository
 * Работает с таблицами products, product_images, product_features
 */

const { getDb } = require('../database');

class ProductRepository {
  /**
   * Создание товара
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create(data) {
    const db = await getDb();
    const {
      name,
      slug,
      brandId,
      categoryId,
      description,
      price,
      oldPrice,
      stockQuantity = 0,
      mainImageUrl,
      isFeatured = false,
    } = data;

    const result = await db.run(
      `INSERT INTO products 
       (name, slug, brand_id, category_id, description, price, old_price, stock_quantity, main_image_url, is_featured)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, slug, brandId, categoryId, description, price, oldPrice, stockQuantity, mainImageUrl, isFeatured]
    );

    return { id: result.lastID, ...data };
  }

  /**
   * Поиск товара по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `, [id]);
  }

  /**
   * Поиск товара по slug
   * @param {string} slug 
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    const db = await getDb();
    return await db.get(`
      SELECT 
        p.*,
        b.name as brand_name,
        b.slug as brand_slug,
        c.name as category_name,
        c.slug as category_slug
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `, [slug]);
  }

  /**
   * Получение списка товаров с фильтрами и пагинацией
   * @param {Object} options 
   * @returns {Promise<Object>}
   */
  async findAll({
    search = '',
    category = 'all',
    brand = '',
    minPrice = 0,
    maxPrice = Number.MAX_SAFE_INTEGER,
    sortBy = 'default',
    limit = 20,
    offset = 0,
  } = {}) {
    const db = await getDb();

    // Базовый запрос
    let query = `
      SELECT 
        p.*,
        b.name as brand_name,
        c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1
    `;

    const params = [];

    // Фильтры
    if (search) {
      query += ` AND (p.name LIKE ? OR b.name LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    if (category !== 'all') {
      query += ` AND c.slug = ?`;
      params.push(category);
    }

    if (brand) {
      query += ` AND b.slug = ?`;
      params.push(brand);
    }

    query += ` AND p.price >= ? AND p.price <= ?`;
    params.push(minPrice, maxPrice);

    // Сортировка
    switch (sortBy) {
      case 'price-asc':
        query += ' ORDER BY p.price ASC';
        break;
      case 'price-desc':
        query += ' ORDER BY p.price DESC';
        break;
      case 'likes-desc':
        query += ' ORDER BY p.likes_count DESC';
        break;
      case 'rating-desc':
        query += ' ORDER BY p.rating DESC';
        break;
      case 'newest':
        query += ' ORDER BY p.created_at DESC';
        break;
      default:
        query += ' ORDER BY p.is_featured DESC, p.created_at DESC';
    }

    // Получаем общее количество (для пагинации)
    const countQuery = query.replace('SELECT p.*, b.name as brand_name, c.name as category_name', 'SELECT COUNT(*) as total');
    const countQueryFinal = countQuery.split('ORDER BY')[0];
    const { total } = await db.get(countQueryFinal, params);

    // Добавляем пагинацию
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await db.all(query, params);

    // Получаем характеристики для каждого товара
    for (const product of products) {
      product.features = await this.getFeatures(product.id);
    }

    return {
      products,
      total,
      limit,
      offset,
      hasMore: offset + products.length < total,
    };
  }

  /**
   * Получение характеристик товара
   * @param {number} productId 
   * @returns {Promise<Array>}
   */
  async getFeatures(productId) {
    const db = await getDb();
    return await db.all(
      'SELECT feature_name, feature_value FROM product_features WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );
  }

  /**
   * Получение изображений товара
   * @param {number} productId 
   * @returns {Promise<Array>}
   */
  async getImages(productId) {
    const db = await getDb();
    return await db.all(
      'SELECT id, image_url, alt_text, is_main FROM product_images WHERE product_id = ? ORDER BY sort_order',
      [productId]
    );
  }

  /**
   * Обновление товара
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const db = await getDb();
    const fields = [];
    const values = [];

    const allowedFields = ['name', 'slug', 'brand_id', 'category_id', 'description', 'price', 'old_price', 'stock_quantity', 'main_image_url', 'is_featured'];
    
    for (const [key, value] of Object.entries(data)) {
      const dbField = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (allowedFields.includes(dbField)) {
        fields.push(`${dbField} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) return this.findById(id);

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      values
    );

    return this.findById(id);
  }

  /**
   * Увеличение счётчика просмотров
   * @param {number} id 
   */
  async incrementViews(id) {
    const db = await getDb();
    await db.run('UPDATE products SET views_count = views_count + 1 WHERE id = ?', [id]);
  }

  /**
   * Увеличение счётчика лайков
   * @param {number} id 
   */
  async incrementLikes(id) {
    const db = await getDb();
    await db.run('UPDATE products SET likes_count = likes_count + 1 WHERE id = ?', [id]);
  }

  /**
   * Уменьшение счётчика лайков
   * @param {number} id 
   */
  async decrementLikes(id) {
    const db = await getDb();
    await db.run('UPDATE products SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', [id]);
  }

  /**
   * Удаление товара (мягкое)
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    await db.run('UPDATE products SET is_active = 0 WHERE id = ?', [id]);
    return true;
  }

  /**
   * Получение популярных товаров
   * @param {number} limit 
   * @returns {Promise<Array>}
   */
  async getFeatured(limit = 8) {
    const db = await getDb();
    return await db.all(`
      SELECT p.*, b.name as brand_name, c.name as category_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.is_active = 1 AND p.is_featured = 1
      ORDER BY p.likes_count DESC, p.rating DESC
      LIMIT ?
    `, [limit]);
  }
}

module.exports = new ProductRepository();
