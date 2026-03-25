/**
 * Auth Controller
 * Обработчики запросов аутентификации
 */

const { authService } = require('../services');

/**
 * Регистрация пользователя
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const result = await authService.register({ username, email, password });

    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      ...result,
    });
  } catch (error) {
    if (error.code === 'USER_EXISTS' || error.code === 'EMAIL_EXISTS') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Вход пользователя
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await authService.login(username, password);

    res.json({
      message: 'Вход выполнен успешно',
      ...result,
    });
  } catch (error) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Получение профиля текущего пользователя
 * GET /api/auth/me
 */
const getMe = async (req, res) => {
  try {
    const user = await authService.getProfile(req.user.id);
    res.json({ user });
  } catch (error) {
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    throw error;
  }
};

/**
 * Обновление профиля
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const { avatarUrl, bio } = req.body;
    const user = await authService.updateProfile(req.user.id, { avatarUrl, bio });
    res.json({ user });
  } catch (error) {
    throw error;
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};
