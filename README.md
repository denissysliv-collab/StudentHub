# 🎓 StudentHub

**Платформа академической взаимопомощи студентов**

StudentHub — это современная веб-платформа для вопросов и ответов, где студенты могут получать помощь по учебным предметам, делиться знаниями и совместно решать задачи.

---

## 📖 Оглавление

- [Возможности](#-возможности)
- [Технологический стек](#-технологический-стек)
- [Архитектура проекта](#-архитектура-проекта)
- [Установка и запуск](#-установка-и-запуск)
- [API Документация](#-api-документация)
- [Структура БД](#-структура-бд)
- [Команда](#-команда)

---

## ✨ Возможности

### Для студентов:
- 📝 **Задавать вопросы** по любым учебным темам с использованием богатого текстового редактора
- 🏷️ **Категоризация** вопросов по предметам (программирование, математика, физика и др.)
- 💬 **Отвечать на вопросы** других студентов
- ⬆️ **Система голосования** (upvote/downvote) за лучшие ответы
- ✅ **Принятие ответа** автором вопроса
- 🔍 **Поиск и фильтрация** вопросов по темам, статусу, дате
- 📊 **Репутация и рейтинг** пользователей
- 🔔 **Уведомления** об ответах и комментариях

### Для сообщества:
- 🏆 **Геймификация** — баллы репутации за полезные ответы
- 📈 **Статистика** активности пользователей
- 🎯 **Теги** для быстрой навигации по темам
- 💾 **Сохранение истории** вопросов и ответов

---

## 🛠️ Технологический стек

### Backend
| Технология | Версия | Описание |
|------------|--------|----------|
| Node.js | 18+ | Платформа |
| Express.js | 4.x | Веб-фреймворк |
| SQLite | 3.x | База данных (dev) |
| JWT | - | Аутентификация |
| BCrypt | 5.x | Хеширование паролей |

### Frontend
| Технология | Описание |
|------------|----------|
| HTML5/CSS3 | Семантическая вёрстка |
| Vanilla JavaScript | Без фреймворков |
| Font Awesome 6 | Иконки |
| Quill.js | WYSIWYG редактор |

### Архитектура
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend    │────▶│  Database   │
│  (HTML/JS)  │◀────│  (Express)   │◀────│   (SQLite)  │
└─────────────┘     └──────────────┘     └─────────────┘
                           │
                    ┌──────▼──────┐
                    │  Services   │
                    │ Controllers │
                    │Repositories │
                    └─────────────┘
```

---

## 📁 Архитектура проекта

```
StudentHub/
├── config/                 # Конфигурация приложения
│   └── index.js
├── controllers/            # Обработчики HTTP-запросов
│   ├── AuthController.js
│   ├── ProductController.js
│   ├── CommentController.js
│   ├── VoteController.js
│   └── QuestionController.js
├── services/               # Бизнес-логика
│   ├── AuthService.js
│   ├── ProductService.js
│   ├── CommentService.js
│   ├── VoteService.js
│   └── QuestionService.js
├── repositories/           # Доступ к данным
│   ├── UserRepository.js
│   ├── ProductRepository.js
│   ├── CategoryRepository.js
│   ├── CommentRepository.js
│   ├── VoteRepository.js
│   ├── QuestionRepository.js
│   ├── AnswerRepository.js
│   └── index.js
├── routes/                 # Маршруты API
│   ├── index.js
│   ├── auth.js
│   ├── products.js
│   ├── comments.js
│   ├── votes.js
│   └── questions.js
├── middleware/             # Промежуточное ПО
│   ├── auth.js            # JWT аутентификация
│   └── validation.js      # Валидация данных
├── database/               # БД утилиты
│   ├── index.js           # Подключение к БД
│   └── schema.sql         # Схема БД
├── js/                     # Frontend JavaScript
│   ├── auth.js            # Модуль аутентификации
│   ├── api.js             # API клиент
│   ├── store.js           # Управление состоянием
│   ├── utils.js           # Утилиты
│   └── components/        # UI компоненты
│       ├── ProductCard.js
│       ├── Filters.js
│       └── ProductModal.js
├── uploads/                # Загруженные файлы
├── .env.example            # Пример переменных окружения
├── .gitignore
├── package.json
├── server.js               # Точка входа
└── README.md

# HTML страницы
├── index.html              # Главная
├── login.html              # Вход
├── registration.html       # Регистрация
├── feed.html               # Лента вопросов
├── ask.html                # Задать вопрос
├── question.html           # Просмотр вопроса
└── profile.html            # Профиль пользователя
```

---

## 🚀 Установка и запуск

### Требования
- Node.js >= 18.0.0
- npm >= 9.0.0

### 1. Клонирование репозитория
```bash
git clone https://github.com/denissysliv-collab/StudentHub.git
cd StudentHub
```

### 2. Установка зависимостей
```bash
npm install
```

### 3. Настройка переменных окружения
```bash
# Создайте файл .env в корне проекта
cp .env.example .env
```

Отредактируйте `.env`:
```env
PORT=3000
HOST=localhost
DB_PATH=./studenthub.db
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
BCRYPT_SALT_ROUNDS=10
NODE_ENV=development
```

### 4. Инициализация базы данных
База данных создаётся автоматически при первом запуске.

### 5. Запуск сервера

#### Development режим (с авто-перезагрузкой):
```bash
npm run dev
```

#### Production режим:
```bash
npm start
```

Сервер запустится на: **http://localhost:3000**

---

## 📡 API Документация

### Базовый URL
```
http://localhost:3000/api
```

### Аутентификация

#### Регистрация
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Ответ:**
```json
{
  "message": "Пользователь успешно зарегистрирован",
  "user": {
    "id": 1,
    "username": "john_doe",
    "email": "john@example.com"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Вход
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "john_doe",
  "password": "securepassword123"
}
```

#### Получение профиля
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Вопросы

#### Получить список вопросов
```http
GET /api/questions?search=JWT&page=1&limit=20&sortBy=newest
```

#### Получить вопрос по ID
```http
GET /api/questions/:id
```

#### Создать вопрос
```http
POST /api/questions
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Как реализовать JWT аутентификацию?",
  "content": "Пытаюсь реализовать JWT...",
  "productId": null,
  "tags": ["nodejs", "security"]
}
```

#### Добавить ответ
```http
POST /api/questions/:id/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Для реализации JWT используйте библиотеку jsonwebtoken..."
}
```

#### Принять ответ
```http
POST /api/answers/:id/accept
Authorization: Bearer <token>
```

### Товары (Каталог)

#### Получить список товаров
```http
GET /api/products?search=iphone&category=all&sortBy=price-asc&page=1&limit=20
```

#### Лайкнуть товар
```http
POST /api/products/:id/like
Authorization: Bearer <token>
```

### Комментарии

#### Получить комментарии
```http
GET /api/comments/product/:id?limit=50&offset=0
```

#### Добавить комментарий
```http
POST /api/comments/product/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Отличный товар!"
}
```

### Голосование

#### Проголосовать
```http
POST /api/votes
Authorization: Bearer <token>
Content-Type: application/json

{
  "votableType": "question",
  "votableId": 1,
  "voteType": "upvote"
}
```

---

## 🗄️ Структура БД

### Основные таблицы

#### users
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

#### questions
```sql
CREATE TABLE questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    product_id INTEGER,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    answers_count INTEGER DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### answers
```sql
CREATE TABLE answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    is_accepted BOOLEAN DEFAULT 0,
    votes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (question_id) REFERENCES questions(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### votes
```sql
CREATE TABLE votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    votable_type TEXT NOT NULL,
    votable_id INTEGER NOT NULL,
    vote_type TEXT NOT NULL,
    UNIQUE(user_id, votable_type, votable_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);
```

#### products
```sql
CREATE TABLE products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category_id INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    rating REAL DEFAULT 0,
    likes_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

Полная схема доступна в файле: [`database/schema.sql`](database/schema.sql)

---

## 🧪 Тестирование

```bash
# Запуск тестов
npm test

# Запуск с покрытием
npm run test:coverage
```

---

## 📝 Лицензия

ISC

---

## 👥 Команда

Разработано студентами для студентов.

**Вклад в проект:**
1. Fork репозиторий
2. Создайте feature branch (`git checkout -b feature/amazing-feature`)
3. Commit изменения (`git commit -m 'Add amazing feature'`)
4. Push в branch (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📞 Контакты

- 📧 Email: support@studenthub.com
- 🌐 Website: studenthub.com
- 💬 Telegram: @studenthub

---

<div align="center">

**StudentHub** © 2025  
*Объединяем знания, ускоряем обучение*

</div>
