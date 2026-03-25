# 🧬 Project DNA — StudentHub

**Название:** StudentHub  
**Версия:** 1.0.0  
**Последнее обновление:** 25 марта 2026 г.

---

## 🎯 Описание

**StudentHub** — платформа академической взаимопомощи студентов для вопросов и ответов по учебным предметам.

**Цель:** Объединить студентов для совместного решения учебных задач, ускорить обучение через взаимопомощь.

---

## 🛠️ Технологический Стек

### Backend
- **Node.js** (18+) — платформа
- **Express.js** (4.x) — веб-фреймворк
- **SQLite** — база данных (dev)
- **JWT** — аутентификация
- **BCrypt** — хеширование паролей

### Frontend
- **HTML5/CSS3** — вёрстка
- **Vanilla JavaScript** — без фреймворков
- **Font Awesome 6** — иконки

### Тестирование
- **Playwright** — браузерные тесты
- **Chromium** — браузер для тестов

---

## 📁 Структура Файлов

```
StudentHub/
├── config/                 # Конфигурация
│   └── index.js
├── controllers/            # Контроллеры
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
├── repositories/           # Доступ к БД
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
│   ├── auth.js
│   └── validation.js
├── database/               # База данных
│   ├── index.js
│   └── schema.sql
├── js/                     # Frontend JavaScript
│   ├── auth.js
│   ├── api.js
│   ├── store.js
│   ├── utils.js
│   └── components/
├── .ai_skills/             # Навыки ИИ
│   ├── browser_vision/
│   └── code_quality/
├── .ai_context/            # Память проекта
│   ├── snapshots/
│   ├── project_dna.md
│   ├── decision_log.md
│   └── todo.md
├── server.js               # Точка входа
├── package.json
├── README.md
└── AI_CONTEXT.md
```

---

## 🌐 Основные Страницы

| Страница | URL | Описание |
|----------|-----|----------|
| Главная | `/` | Редирект на feed.html |
| Лента | `/feed.html` | Лента вопросов |
| Вопрос | `/question.html` | Просмотр вопроса |
| Задать | `/ask.html` | Создание вопроса |
| Вход | `/login.html` | Авторизация |
| Регистрация | `/registration.html` | Регистрация |
| Профиль | `/profile.html` | Профиль пользователя |

---

## 🔑 API Endpoints

### Аутентификация
- `POST /api/auth/register` — Регистрация
- `POST /api/auth/login` — Вход
- `GET /api/auth/me` — Профиль

### Вопросы
- `GET /api/questions` — Список вопросов
- `GET /api/questions/:id` — Вопрос по ID
- `POST /api/questions` — Создать вопрос
- `POST /api/questions/:id/answers` — Добавить ответ

### Товары
- `GET /api/products` — Список товаров
- `GET /api/products/:id` — Товар по ID
- `POST /api/products/:id/like` — Лайк

---

## 🎯 Ключевые Функции

1. **Вопросы и ответы** — студенты задают вопросы, другие отвечают
2. **Голосования** — upvote/downvote за лучшие ответы
3. **Принятие ответа** — автор выбирает лучший ответ
4. **Теги** — категоризация вопросов по темам
5. **Репутация** — система баллов за полезные ответы
6. **Аутентификация** — JWT токены для безопасности

---

## 📊 База Данных

**Таблицы:**
- `users` — пользователи
- `questions` — вопросы
- `answers` — ответы
- `votes` — голосования
- `tags` — теги
- `question_tags` — связь вопросов и тегов
- `comments` — комментарии
- `products` — товары
- `categories` — категории
- `brands` — бренды

---

## 🚀 Запуск Проекта

```bash
# Установка зависимостей
npm install

# Запуск сервера
npm start

# Development режим
npm run dev
```

**Сервер:** http://localhost:3000

---

## 🧪 Тестирование

```bash
# Browser Vision тесты
node .ai_skills/browser_vision/template.js

# Проверка кода
npm run lint
npm run format
```

---

## 📞 Контакты

**Репозиторий:** https://github.com/denissysliv-collab/StudentHub

---

**🧬 Это ДНК проекта. Храни и передавай контекст!**
