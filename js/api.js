/**
 * API Client
 * Модуль для работы с backend API
 */

const API_BASE_URL = 'http://localhost:3000/api';

/**
 * Получение токена из localStorage
 */
function getToken() {
  return localStorage.getItem('auth_token');
}

/**
 * Сохранение токена
 */
function setToken(token) {
  localStorage.setItem('auth_token', token);
}

/**
 * Удаление токена
 */
function removeToken() {
  localStorage.removeItem('auth_token');
}

/**
 * Выполнение HTTP запроса
 */
async function request(endpoint, options = {}) {
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
      throw new ApiError(data.error || 'Ошибка запроса', data.code, data);
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Ошибка сети', 'NETWORK_ERROR', { originalError: error.message });
  }
}

/**
 * Класс ошибки API
 */
class ApiError extends Error {
  constructor(message, code, data) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.data = data;
  }
}

// ============================================
// Auth API
// ============================================

export const authApi = {
  register(username, email, password) {
    return request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  login(username, password) {
    return request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  logout() {
    removeToken();
  },

  async getMe() {
    const data = await request('/auth/me');
    return data.user;
  },

  updateProfile(data) {
    return request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// Products API
// ============================================

export const productsApi = {
  getProducts(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/products${queryString ? `?${queryString}` : ''}`);
  },

  getProduct(id) {
    return request(`/products/${id}`);
  },

  getFeatured(limit = 8) {
    return request(`/products/featured?limit=${limit}`);
  },

  getCategories() {
    return request('/categories');
  },

  toggleLike(id) {
    return request(`/products/${id}/like`, {
      method: 'POST',
    });
  },
};

// ============================================
// Comments API
// ============================================

export const commentsApi = {
  getComments(parentType, parentId, params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/comments/${parentType}/${parentId}${queryString ? `?${queryString}` : ''}`);
  },

  addComment(parentType, parentId, content) {
    return request(`/comments/${parentType}/${parentId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  updateComment(id, content) {
    return request(`/comments/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ content }),
    });
  },

  deleteComment(id) {
    return request(`/comments/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Votes API
// ============================================

export const votesApi = {
  vote(votableType, votableId, voteType) {
    return request('/votes', {
      method: 'POST',
      body: JSON.stringify({ votableType, votableId, voteType }),
    });
  },

  getUserVote(votableType, votableId) {
    return request(`/votes/${votableType}/${votableId}`);
  },
};

// ============================================
// Questions API
// ============================================

export const questionsApi = {
  getQuestions(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return request(`/questions${queryString ? `?${queryString}` : ''}`);
  },

  getQuestion(id) {
    return request(`/questions/${id}`);
  },

  createQuestion(title, content, productId, tags = []) {
    return request('/questions', {
      method: 'POST',
      body: JSON.stringify({ title, content, productId, tags }),
    });
  },

  addAnswer(questionId, content) {
    return request(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  acceptAnswer(answerId) {
    return request(`/answers/${answerId}/accept`, {
      method: 'POST',
    });
  },

  deleteQuestion(id) {
    return request(`/questions/${id}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// Экспорт утилит
// ============================================

export { getToken, setToken, removeToken, request, ApiError };
