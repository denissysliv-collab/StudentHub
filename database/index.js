/**
 * Database connection manager
 * Управляет подключением к SQLite базе данных
 */

const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const config = require('../config');

let dbInstance = null;

/**
 * Получение экземпляра базы данных (singleton)
 * @returns {Promise<Database>}
 */
async function getDb() {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = await open({
    filename: config.database.filename,
    driver: sqlite3.Database,
  });

  // Включаем поддержку внешних ключей
  await dbInstance.exec('PRAGMA foreign_keys = ON');

  console.log('📊 База данных подключена:', config.database.filename);
  return dbInstance;
}

/**
 * Закрытие соединения с базой данных
 */
async function closeDb() {
  if (dbInstance) {
    await dbInstance.close();
    dbInstance = null;
    console.log('База данных отключена');
  }
}

/**
 * Инициализация базы данных (создание таблиц)
 */
async function initDatabase() {
  const db = await getDb();
  const fs = require('fs');
  const path = require('path');

  const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
  
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    await db.exec(schema);
    console.log('✅ Схема базы данных загружена');
  }

  return db;
}

module.exports = {
  getDb,
  closeDb,
  initDatabase,
};
