/**
 * Category Repository
 * Работает с таблицей categories
 */

const { getDb } = require('../database');

class CategoryRepository {
  /**
   * Получение всех категорий
   * @returns {Promise<Array>}
   */
  async findAll() {
    const db = await getDb();
    return await db.all(`
      SELECT c.*, 
             parent.name as parent_name,
             (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = 1) as products_count
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.is_active = 1
      ORDER BY c.sort_order, c.name
    `);
  }

  /**
   * Поиск категории по ID
   * @param {number} id 
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    const db = await getDb();
    return await db.get(`
      SELECT c.*, parent.name as parent_name
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.id = ?
    `, [id]);
  }

  /**
   * Поиск категории по slug
   * @param {string} slug 
   * @returns {Promise<Object|null>}
   */
  async findBySlug(slug) {
    const db = await getDb();
    return await db.get(`
      SELECT c.*, parent.name as parent_name
      FROM categories c
      LEFT JOIN categories parent ON c.parent_id = parent.id
      WHERE c.slug = ?
    `, [slug]);
  }

  /**
   * Получение дочерних категорий
   * @param {number} parentId 
   * @returns {Promise<Array>}
   */
  async findChildren(parentId) {
    const db = await getDb();
    return await db.all(
      'SELECT * FROM categories WHERE parent_id = ? AND is_active = 1 ORDER BY sort_order, name',
      [parentId]
    );
  }

  /**
   * Создание категории
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async create({ name, slug, description, parentId, iconUrl }) {
    const db = await getDb();
    const result = await db.run(
      'INSERT INTO categories (name, slug, description, parent_id, icon_url) VALUES (?, ?, ?, ?, ?)',
      [name, slug, description, parentId, iconUrl]
    );
    return { id: result.lastID, name, slug, description, parentId, iconUrl };
  }

  /**
   * Обновление категории
   * @param {number} id 
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async update(id, { name, slug, description, parentId, iconUrl }) {
    const db = await getDb();
    await db.run(
      `UPDATE categories 
       SET name = COALESCE(?, name),
           slug = COALESCE(?, slug),
           description = COALESCE(?, description),
           parent_id = COALESCE(?, parent_id),
           icon_url = COALESCE(?, icon_url)
       WHERE id = ?`,
      [name, slug, description, parentId, iconUrl, id]
    );
    return this.findById(id);
  }

  /**
   * Удаление категории
   * @param {number} id 
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    const db = await getDb();
    await db.run('UPDATE categories SET is_active = 0 WHERE id = ?', [id]);
    return true;
  }
}

module.exports = new CategoryRepository();
