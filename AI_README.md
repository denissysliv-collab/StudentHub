# 🤖 AI Readme — Инструкция для ИИ-Ассистента

**Проект:** StudentHub  
**Последнее обновление:** 25 марта 2026 г.

---

## 🎯 Назначение

Этот файл — точка входа для ИИ-ассистента в начале каждого нового чата.

---

## 🚀 Для Начала Работы

**Используй скилл Context Master:**

1. Открой `.ai_skills/context_master/manifest.md`
2. Прочитай алгоритм "Пробуждения"
3. Проверь `.ai_context/project_dna.md`
4. Выполни задачи из `.ai_context/todo.md`

**Все инструкции — в `.ai_skills/`**  
**Все данные — в `.ai_context/`**

---

## 📚 Где Что Искать

### 🧠 Инструкции по Навыкам → `.ai_skills/`

**Путь:** `.ai_skills/`

Здесь хранятся переносные навыки ("суперсилы"):

```
.ai_skills/
├── browser_vision/      # "Глаза" — тестирование браузером
│   ├── manifest.md      # Что, когда и зачем использовать
│   ├── setup.md         # Инструкция по установке
│   └── template.js      # Универсальный шаблон
└── code_quality/        # "Чистота" — ESLint + Prettier
    ├── manifest.md
    ├── setup.md
    └── .prettierrc
```

**В начале чата:**
1. Открой `.ai_skills/browser_vision/manifest.md` — узнай, когда использовать "глаза"
2. Открой `.ai_skills/code_quality/manifest.md` — узнай, когда проверять код

---

### 🧬 Данные Проекта → `.ai_context/`

**Путь:** `.ai_context/`

Здесь хранится уникальная память об этом проекте:

```
.ai_context/
├── project_dna.md       # ДНК проекта (стек, цели, структура)
├── decision_log.md      # История важных решений
├── todo.md              # Текущие задачи
└── snapshots/           # Скриншоты
```

**В начале чата:**
1. Открой `.ai_context/project_dna.md` — вспомни контекст проекта
2. Открой `.ai_context/decision_log.md` — помни прошлые решения
3. Открой `.ai_context/todo.md` — видишь текущие задачи

---

## 🚀 Быстрый Старт в Новом Чате

**Чеклист начала работы:**

```markdown
- [ ] Прочитать `.ai_skills/browser_vision/manifest.md`
- [ ] Прочитать `.ai_skills/code_quality/manifest.md`
- [ ] Прочитать `.ai_context/project_dna.md`
- [ ] Прочитать `.ai_context/decision_log.md`
- [ ] Проверить `.ai_context/todo.md`
```

**После прочтения:**
- ✅ Ты знаешь свои возможности (навыки)
- ✅ Ты помнишь контекст проекта
- ✅ Ты видишь текущие задачи
- ✅ Ты готов к работе!

---

## 📦 Доступные Навыки

### 👁️ Browser Vision

**Когда использовать:**
- Проверка вёрстки
- Поиск ошибок в консоли
- Эмуляция мобильных устройств
- Скриншоты для анализа

**Команды:**
```bash
node .ai_skills/browser_vision/template.js http://localhost:3000/
```

### 🧹 Code Quality

**Когда использовать:**
- Перед коммитом
- Code Review
- Рефакторинг
- Новый разработчик в проекте

**Команды:**
```bash
npm run lint
npm run lint:fix
npm run format
```

---

## 🎯 Контекст Проекта

### Стек
- **Backend:** Node.js + Express + SQLite
- **Frontend:** HTML/CSS/JS (Vanilla)
- **Auth:** JWT
- **Test:** Playwright

### Структура
```
StudentHub/
├── controllers/
├── services/
├── repositories/
├── routes/
├── middleware/
├── database/
├── js/
├── .ai_skills/
├── .ai_context/
└── server.js
```

### Ключевые Решения
- Фиксированная кнопка "Задать вопрос" (350x53px, отступ 100px)
- Организация навыков в `.ai_skills/`
- Память проекта в `.ai_context/`

---

## 📞 Контакты

**Репозиторий:** https://github.com/denissysliv-collab/StudentHub

---

## ⚠️ Важно!

**В начале КАЖДОГО нового чата:**
1. Читай `manifest.md` в `.ai_skills/` — это твои возможности
2. Читай `project_dna.md` в `.ai_context/` — это твой контекст

**Не начинай работу без прочтения!**

---

**🤖 Удачи в работе! Ты вооружён знаниями и навыками!** 🚀
