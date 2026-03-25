-- ============================================================
-- StudentHub - Полная схема базы данных
-- Версия: 1.0.0
-- Движок: SQLite (с возможностью миграции на PostgreSQL)
-- ============================================================

-- Включаем поддержку внешних ключей
PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. ПОЛЬЗОВАТЕЛИ И АУТЕНТИФИКАЦИЯ
-- ============================================================

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    role TEXT DEFAULT 'user' CHECK(role IN ('user', 'moderator', 'admin')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Индексы для ускорения поиска
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Таблица сессий (для управления токенами)
CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);

-- ============================================================
-- 2. КАТАЛОГ ТОВАРОВ
-- ============================================================

-- Категории товаров
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    parent_id INTEGER,
    icon_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- Бренды
CREATE TABLE IF NOT EXISTS brands (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    website_url TEXT,
    is_active BOOLEAN DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_brands_slug ON brands(slug);

-- Товары
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    brand_id INTEGER,
    category_id INTEGER NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    old_price DECIMAL(10, 2),
    currency TEXT DEFAULT 'RUB',
    stock_quantity INTEGER DEFAULT 0,
    rating REAL DEFAULT 0 CHECK(rating >= 0 AND rating <= 5),
    reviews_count INTEGER DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    main_image_url TEXT,
    is_active BOOLEAN DEFAULT 1,
    is_featured BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_likes ON products(likes_count);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(is_featured);

-- Изображения товаров
CREATE TABLE IF NOT EXISTS product_images (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    sort_order INTEGER DEFAULT 0,
    is_main BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);

-- Характеристики товаров (ключ-значение)
CREATE TABLE IF NOT EXISTS product_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    feature_name TEXT NOT NULL,
    feature_value TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id);

-- ============================================================
-- 3. ОТЗЫВЫ И КОММЕНТАРИИ
-- ============================================================

-- Отзывы о товарах
CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    pros TEXT,
    cons TEXT,
    is_verified_purchase BOOLEAN DEFAULT 0,
    is_approved BOOLEAN DEFAULT 0,
    helpful_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(product_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON reviews(rating);
CREATE INDEX IF NOT EXISTS idx_reviews_approved ON reviews(is_approved);

-- Комментарии (для вопросов и ответов)
CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    parent_type TEXT NOT NULL CHECK(parent_type IN ('product', 'question', 'answer')),
    parent_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_comment_id INTEGER,
    is_deleted BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_type, parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_user ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_comment ON comments(parent_comment_id);

-- ============================================================
-- 4. ВОПРОСЫ И ОТВЕТЫ (Q&A)
-- ============================================================

-- Вопросы
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    is_pinned BOOLEAN DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_questions_user ON questions(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_product ON questions(product_id);
CREATE INDEX IF NOT EXISTS idx_questions_resolved ON questions(is_resolved);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions(created_at);

-- Ответы на вопросы
CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_user ON answers(user_id);
CREATE INDEX IF NOT EXISTS idx_answers_accepted ON answers(is_accepted);

-- ============================================================
-- 5. ГОЛОСОВАНИЯ (UPVOTE/DOWNVOTE)
-- ============================================================

CREATE TABLE IF NOT EXISTS votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    votable_type TEXT NOT NULL CHECK(votable_type IN ('question', 'answer', 'review', 'comment')),
    votable_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL CHECK(vote_type IN ('upvote', 'downvote')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, votable_type, votable_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_votes_user ON votes(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_votable ON votes(votable_type, votable_id);

-- ============================================================
-- 6. ТЕГИ
-- ============================================================

CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    questions_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);

-- Связь вопросов и тегов
CREATE TABLE IF NOT EXISTS question_tags (
    question_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (question_id, tag_id),
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_question_tags_question ON question_tags(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_tag ON question_tags(tag_id);

-- ============================================================
-- 7. КОРЗИНА И ИЗБРАННОЕ
-- ============================================================

-- Корзина
CREATE TABLE IF NOT EXISTS cart_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK(quantity > 0),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_user ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_product ON cart_items(product_id);

-- Избранное (лайки)
CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_product ON favorites(product_id);

-- ============================================================
-- 8. ЗАКАЗЫ
-- ============================================================

-- Заказы
CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
    total_amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_address TEXT,
    shipping_method TEXT,
    payment_method TEXT,
    payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Элементы заказа
CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10, 2) NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    subtotal DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ============================================================
-- 9. УВЕДОМЛЕНИЯ
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('order', 'review', 'question', 'answer', 'vote', 'system')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link_url TEXT,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at);

-- ============================================================
-- 10. СИСТЕМНЫЕ ТАБЛИЦЫ
-- ============================================================

-- История изменений цен
CREATE TABLE IF NOT EXISTS price_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    product_id INTEGER NOT NULL,
    old_price DECIMAL(10, 2),
    new_price DECIMAL(10, 2) NOT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    changed_by INTEGER,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_price_history_product ON price_history(product_id);

-- Лог действий (audit log)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    old_values TEXT,
    new_values TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at);

-- ============================================================
-- 11. ПРЕДЗАПОЛНЕНИЕ ДАННЫХ
-- ============================================================

-- Категории
INSERT OR IGNORE INTO categories (name, slug, description, sort_order) VALUES
    ('Телефоны', 'phones', 'Смартфоны и мобильные телефоны', 1),
    ('Ноутбуки', 'laptops', 'Ноутбуки и ультрабуки', 2),
    ('Планшеты', 'tablets', 'Планшетные компьютеры', 3),
    ('Аксессуары', 'accessories', 'Аксессуары для электроники', 4),
    ('Наушники', 'headphones', 'Наушники и аудиотехника', 5),
    ('Умные часы', 'smartwatches', 'Умные часы и фитнес-трекеры', 6);

-- Бренды
INSERT OR IGNORE INTO brands (name, slug, description) VALUES
    ('Apple', 'apple', 'Американская компания по производству электроники'),
    ('Samsung', 'samsung', 'Южнокорейская корпорация'),
    ('Sony', 'sony', 'Японская компания по производству электроники'),
    ('Google', 'google', 'Американская технологическая компания'),
    ('Dell', 'dell', 'Американский производитель компьютеров'),
    ('Xiaomi', 'xiaomi', 'Китайская компания по производству электроники'),
    ('EIFFELAROMA', 'eiffelaroma', 'Производитель ароматизаторов');

-- Товары (демо-данные)
INSERT OR IGNORE INTO products (name, slug, brand_id, category_id, description, price, old_price, rating, reviews_count, likes_count, stock_quantity, is_featured) VALUES
    ('Набор ароматизаторов EIFFELAROMA', 'eiffelaroma-set', 7, 4, 'Набор автомобильных ароматизаторов с популярными ароматами', 329, 3325, 4.9, 9335, 124, 100, 1),
    ('iPhone 14 128GB', 'iphone-14-128gb', 1, 1, 'Смартфон Apple iPhone 14 с 6.1" OLED дисплеем', 69990, 79990, 4.8, 15420, 89, 50, 1),
    ('Samsung Galaxy S23', 'samsung-galaxy-s23', 2, 1, 'Флагманский смартфон Samsung с AMOLED дисплеем', 64990, 74990, 4.7, 8320, 67, 75, 1),
    ('MacBook Pro 14"', 'macbook-pro-14', 1, 2, 'Мощный ноутбук с чипом M3 Pro', 189990, 209990, 4.9, 7210, 243, 25, 1),
    ('Dell XPS 13 Plus', 'dell-xps-13-plus', 5, 2, 'Ультрабук Dell с процессором Intel Core i7', 139990, 159990, 4.6, 3100, 56, 30, 0),
    ('iPad Air 5', 'ipad-air-5', 1, 3, 'Планшет Apple с чипом M1', 55990, 62990, 4.8, 11340, 112, 60, 1),
    ('Sony WH-1000XM5', 'sony-wh-1000xm5', 3, 5, 'Беспроводные наушники с шумоподавлением', 27990, 34990, 4.9, 28760, 445, 100, 1),
    ('Google Pixel 7', 'google-pixel-7', 4, 1, 'Смартфон Google с чипом Tensor G2', 44990, 54990, 4.5, 6210, 77, 40, 0);

-- Характеристики товаров
INSERT OR IGNORE INTO product_features (product_id, feature_name, feature_value, sort_order) VALUES
    (1, 'Аромат 1', 'Tobacco Vanille', 1),
    (1, 'Аромат 2', 'Lost Cherry', 2),
    (1, 'Аромат 3', 'Lacoste L1212 White', 3),
    (1, 'Аромат 4', 'Boss Bottled No.6', 4),
    (1, 'Аромат 5', 'Fleur Narcotique', 5),
    (2, 'Дисплей', '6.1" OLED', 1),
    (2, 'Процессор', 'A15 Bionic', 2),
    (2, 'Память', '128 ГБ', 3),
    (3, 'Дисплей', '6.6" AMOLED', 1),
    (3, 'Процессор', 'Snapdragon 8 Gen 2', 2),
    (3, 'Память', '256 ГБ', 3),
    (4, 'Процессор', 'M3 Pro', 1),
    (4, 'ОЗУ', '18 ГБ', 2),
    (4, 'SSD', '512 ГБ', 3),
    (7, 'Тип', 'Беспроводные', 1),
    (7, 'Шумоподавление', 'Активное', 2),
    (7, 'Время работы', '30 часов', 3),
    (7, 'Bluetooth', '5.2', 4);

-- Теги
INSERT OR IGNORE INTO tags (name, slug, description) VALUES
    ('новинка', 'new', 'Новые товары'),
    ('хит', 'bestseller', 'Популярные товары'),
    ('скидка', 'sale', 'Товары со скидкой'),
    ('премиум', 'premium', 'Премиум сегмент'),
    ('бюджетный', 'budget', 'Бюджетные варианты');

-- ============================================================
-- 12. ТРИГГЕРЫ (автоматизация)
-- ============================================================

-- Триггер для обновления количества лайков
CREATE TRIGGER IF NOT EXISTS update_product_likes_count_after_insert
AFTER INSERT ON favorites
BEGIN
    UPDATE products SET likes_count = likes_count + 1 WHERE id = NEW.product_id;
END;

CREATE TRIGGER IF NOT EXISTS update_product_likes_count_after_delete
AFTER DELETE ON favorites
BEGIN
    UPDATE products SET likes_count = likes_count - 1 WHERE id = OLD.product_id;
END;

-- Триггер для обновления количества ответов
CREATE TRIGGER IF NOT EXISTS update_question_answers_count_after_insert
AFTER INSERT ON answers
BEGIN
    UPDATE questions SET answers_count = answers_count + 1 WHERE id = NEW.question_id;
END;

-- Триггер для обновления рейтинга товара после добавления отзыва
CREATE TRIGGER IF NOT EXISTS update_product_rating_after_review
AFTER INSERT ON reviews
WHEN NEW.is_approved = 1
BEGIN
    UPDATE products 
    SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = NEW.product_id AND is_approved = 1),
        reviews_count = (SELECT COUNT(*) FROM reviews WHERE product_id = NEW.product_id AND is_approved = 1)
    WHERE id = NEW.product_id;
END;

-- Триггер для логирования изменений цен
CREATE TRIGGER IF NOT EXISTS log_price_changes
AFTER UPDATE OF price ON products
WHEN OLD.price != NEW.price
BEGIN
    INSERT INTO price_history (product_id, old_price, new_price) 
    VALUES (NEW.id, OLD.price, NEW.price);
END;

-- ============================================================
-- Конец схемы БД
-- ============================================================
