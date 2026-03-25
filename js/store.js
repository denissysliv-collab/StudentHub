/**
 * Store - Управление состоянием приложения
 * Простая реализация реактивного хранилища
 */

// ============================================
// Состояние приложения
// ============================================

const state = {
  // Аутентификация
  user: null,
  isAuthenticated: false,

  // Каталог
  products: [],
  categories: [],
  currentProduct: null,
  filters: {
    search: '',
    category: 'all',
    sortBy: 'default',
    page: 1,
    limit: 20,
  },

  // UI
  loading: false,
  error: null,
  modal: {
    isOpen: false,
    type: null,
    data: null,
  },
};

// ============================================
// Подписчики на изменения
// ============================================

const subscribers = new Set();

function subscribe(callback) {
  subscribers.add(callback);
  return () => subscribers.delete(callback);
}

function notify() {
  subscribers.forEach(callback => callback({ ...state }));
}

// ============================================
// Геттеры
// ============================================

function getState() {
  return { ...state };
}

function getUser() {
  return state.user;
}

function isAuthenticated() {
  return state.isAuthenticated;
}

function getFilters() {
  return { ...state.filters };
}

// ============================================
// Экшены
// ============================================

function setUser(user) {
  state.user = user;
  state.isAuthenticated = !!user;
  notify();
}

function setLoading(loading) {
  state.loading = loading;
  notify();
}

function setError(error) {
  state.error = error;
  notify();
}

function clearError() {
  state.error = null;
  notify();
}

function setProducts(products) {
  state.products = products;
  notify();
}

function setCategories(categories) {
  state.categories = categories;
  notify();
}

function setCurrentProduct(product) {
  state.currentProduct = product;
  notify();
}

function setFilters(filters) {
  state.filters = { ...state.filters, ...filters };
  notify();
}

function resetFilters() {
  state.filters = {
    search: '',
    category: 'all',
    sortBy: 'default',
    page: 1,
    limit: 20,
  };
  notify();
}

function openModal(type, data = null) {
  state.modal = { isOpen: true, type, data };
  notify();
}

function closeModal() {
  state.modal = { isOpen: false, type: null, data: null };
  notify();
}

// ============================================
// Инициализация
// ============================================

function initStore() {
  // Проверяем наличие токена
  const token = localStorage.getItem('auth_token');
  if (token) {
    // Токен есть, но пользователя ещё не загрузили
    // Это будет сделано при первом запросе к API
  }
}

// ============================================
// Экспорт
// ============================================

export const store = {
  getState,
  getUser,
  isAuthenticated,
  getFilters,
  setUser,
  setLoading,
  setError,
  clearError,
  setProducts,
  setCategories,
  setCurrentProduct,
  setFilters,
  resetFilters,
  openModal,
  closeModal,
  subscribe,
  init: initStore,
};
