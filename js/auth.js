/**
 * Auth Module
 * Общий модуль аутентификации для всех страниц
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Проверка аутентификации пользователя
 */
function checkAuth() {
  const token = localStorage.getItem('auth_token');
  const user = localStorage.getItem('auth_user');
  
  if (token && user) {
    return JSON.parse(user);
  }
  return null;
}

/**
 * Выход пользователя с подтверждением
 */
function logout(confirmLogout = true) {
  if (confirmLogout && !confirm('Вы действительно хотите выйти из аккаунта?')) {
    return;
  }
  
  localStorage.removeItem('auth_token');
  localStorage.removeItem('auth_user');
  
  // Показываем уведомление если доступно
  if (typeof showToast === 'function') {
    showToast('Вы успешно вышли из системы', 'success', 2000);
  }
  
  // Перенаправление на страницу входа
  setTimeout(() => {
    window.location.href = 'login.html';
  }, 500);
}

/**
 * Обновление UI в зависимости от статуса аутентификации
 */
function updateAuthUI() {
  const user = checkAuth();
  const navUserMenu = document.querySelector('.nav-user-menu');
  const navAvatar = document.querySelector('.nav-avatar');
  
  if (user && navAvatar) {
    const initial = (user.username || user.email || 'U')[0].toUpperCase();
    navAvatar.innerHTML = `<span>${initial}</span>`;
    navAvatar.href = 'profile.html';
    navAvatar.title = user.username;
  }
  
  // Добавляем кнопку выхода если пользователь авторизован
  if (user && navUserMenu) {
    const logoutBtn = document.createElement('button');
    logoutBtn.className = 'btn btn-outline btn-sm';
    logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Выход';
    logoutBtn.onclick = logout;
    navUserMenu.appendChild(logoutBtn);
  }
}

/**
 * Требуется авторизация - перенаправить на login если не авторизован
 */
function requireAuth() {
  const user = checkAuth();
  if (!user) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

/**
 * Получение токена
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Выполнение API запроса
 */
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const config = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Ошибка запроса');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Показ уведомления
 */
function showToast(message, type = 'info', duration = 3000) {
  // Удаляем старые уведомления
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = `toast-notification notification notification-${type}`;
  toast.style.cssText = `
    position: fixed;
    top: 100px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 12px;
    background: white;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 12px;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    z-index: 9999;
    border-left: 4px solid ${type === 'success' ? '#10b981' : '#ef4444'};
  `;
  
  const icon = type === 'success' ? '✓' : '⚠';
  toast.innerHTML = `
    <span style="font-size: 24px; color: ${type === 'success' ? '#10b981' : '#ef4444'}">${icon}</span>
    <span class="notification-message" style="font-weight: 500;">${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  // Анимация появления
  setTimeout(() => {
    toast.style.transform = 'translateX(0)';
  }, 10);
  
  // Удаление через duration
  setTimeout(() => {
    toast.style.transform = 'translateX(400px)';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Экспорт для использования в других файлах
window.StudentHub = {
  checkAuth,
  logout,
  updateAuthUI,
  requireAuth,
  getToken,
  apiRequest,
  showToast,
};

// Автоматическое обновление UI при загрузке
document.addEventListener('DOMContentLoaded', () => {
  updateAuthUI();
});
