/**
 * ProductModal Component
 * Модальное окно просмотра товара
 */

import { formatPrice, timeAgo } from '../utils.js';

/**
 * Создание модального окна товара
 */
export function createProductModal(product) {
  const modal = document.getElementById('productModal') || createModalContainer();
  const modalBody = document.getElementById('modalBody');

  const fullStars = Math.floor(product.rating || 0);
  const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

  // Формируем HTML характеристик
  let featuresHtml = '';
  if (product.features && product.features.length) {
    featuresHtml = `
      <ul class="detail-features">
        ${product.features.map(f => `<li>${escapeHtml(f.feature_value)}</li>`).join('')}
      </ul>
    `;
  }

  // Формируем HTML изображений
  let imagesHtml = '';
  if (product.images && product.images.length) {
    imagesHtml = product.images.map((img, index) => `
      <img class="detail-image ${index === 0 ? 'active' : ''}" 
           src="${img.image_url}" 
           alt="${img.alt_text || product.name}"
           data-index="${index}">
    `).join('');
  } else {
    imagesHtml = `<img class="detail-image active" src="data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 700 400%22%3E%3Crect fill=%22%23f0f3f7%22 width=%22700%22 height=%22400%22/%3E%3Ctext fill=%22%2394a3b8%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EНет изображения%3C/text%3E%3C/svg%3E" alt="${product.name}">`;
  }

  modalBody.innerHTML = `
    <div class="modal-gallery">
      ${imagesHtml}
      ${product.images?.length > 1 ? `
        <div class="gallery-thumbnails">
          ${product.images.map((img, i) => `
            <img class="thumbnail ${i === 0 ? 'active' : ''}" 
                 src="${img.image_url}" 
                 data-index="${i}"
                 alt="${img.alt_text || product.name}">
          `).join('')}
        </div>
      ` : ''}
    </div>
    
    <div class="modal-info">
      <div class="detail-header">
        <h2 class="detail-title">${escapeHtml(product.name)}</h2>
        <div class="detail-like">
          <button class="detail-like-btn" data-id="${product.id}" aria-label="Лайк">
            ❤️
          </button>
          <span class="detail-like-count" data-like-count="${product.id}">${product.likes_count || 0}</span>
        </div>
      </div>
      
      ${product.brand_name ? `<p class="detail-brand">Бренд: <strong>${escapeHtml(product.brand_name)}</strong></p>` : ''}
      
      <div class="detail-price">
        <span class="detail-current">${formatPrice(product.price)}</span>
        ${product.old_price ? `<span class="detail-old">${formatPrice(product.old_price)}</span>` : ''}
      </div>
      
      <div class="detail-rating">
        <span class="stars-large">${stars}</span>
        <span class="rating-value">${product.rating?.toFixed(1) || 'N/A'}</span>
        <span class="reviews-count">(${product.reviews_count || 0} оценок)</span>
      </div>
      
      ${featuresHtml}
      
      ${product.delivery_date ? `
        <div class="detail-delivery">
          🚚 Доставка: ${escapeHtml(product.delivery_date)}
        </div>
      ` : ''}
      
      ${product.stock_quantity > 0 
        ? '<div class="detail-stock in-stock">✓ В наличии</div>'
        : '<div class="detail-stock out-of-stock">✗ Нет в наличии</div>'
      }
      
      <div class="comments-section" id="comments-section-${product.id}">
        ${createCommentsSection(product.id)}
      </div>
      
      <div class="modal-actions">
        <button class="modal-btn-primary" data-action="buy" data-id="${product.id}">
          🛒 Купить
        </button>
        <button class="modal-btn-secondary" data-action="cart" data-id="${product.id}">
          📦 В корзину
        </button>
      </div>
    </div>
  `;

  return modal;
}

/**
 * Создание секции комментариев
 */
function createCommentsSection(productId) {
  return `
    <div class="comments-header" id="toggle-comments-${productId}">
      <h3>💬 Комментарии (<span data-comments-count="${productId}">0</span>)</h3>
      <span class="toggle-icon" id="toggle-icon-${productId}">›</span>
    </div>
    <div class="comments-list collapsed" id="comments-list-${productId}">
      <div class="comments-loading">Загрузка комментариев...</div>
    </div>
    <div class="comment-input-group">
      <input 
        type="text" 
        class="comment-input" 
        id="comment-input-${productId}" 
        placeholder="Ваш комментарий..."
        maxlength="2000">
      <button class="comment-submit" data-product-id="${productId}">
        Отправить
      </button>
    </div>
  `;
}

/**
 * Создание контейнера модального окна
 */
function createModalContainer() {
  const modal = document.createElement('div');
  modal.id = 'productModal';
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-modal">&times;</span>
      <div id="modalBody"></div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

/**
 * Обновление счётчика лайков в модалке
 */
export function updateModalLikeCount(productId, count) {
  const countElement = document.querySelector(`[data-like-count="${productId}"]`);
  if (countElement) {
    countElement.textContent = count;
  }
}

/**
 * Обновление счётчика комментариев
 */
export function updateCommentsCount(productId, count) {
  const countElement = document.querySelector(`[data-comments-count="${productId}"]`);
  if (countElement) {
    countElement.textContent = count;
  }
}

/**
 * Добавление комментария в список
 */
export function appendComment(productId, comment) {
  const list = document.getElementById(`comments-list-${productId}`);
  if (!list) return;

  // Удаляем сообщение о загрузке или "нет комментариев"
  const loadingMsg = list.querySelector('.comments-loading, .no-comments');
  if (loadingMsg) loadingMsg.remove();

  const commentEl = document.createElement('div');
  commentEl.className = 'comment-item';
  commentEl.dataset.id = comment.id;
  commentEl.innerHTML = `
    <div class="comment-author">
      <strong>${escapeHtml(comment.username || 'Аноним')}</strong>
      <span class="comment-time">${timeAgo(comment.created_at)}</span>
    </div>
    <div class="comment-content">${escapeHtml(comment.content)}</div>
  `;

  list.appendChild(commentEl);
  list.scrollTop = list.scrollHeight;
}

/**
 * Показ состояния "нет комментариев"
 */
export function showNoComments(productId) {
  const list = document.getElementById(`comments-list-${productId}`);
  if (!list) return;

  list.innerHTML = '<p class="no-comments">Нет комментариев. Будьте первым!</p>';
}

/**
 * Экранирование HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
