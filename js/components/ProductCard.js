/**
 * ProductCard Component
 * Карточка товара в каталоге
 */

import { formatPrice, timeAgo } from './utils.js';

/**
 * Создание карточки товара
 */
export function createProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.id = product.id;

  const fullStars = Math.floor(product.rating || 0);
  const stars = '★'.repeat(fullStars) + '☆'.repeat(5 - fullStars);

  card.innerHTML = `
    <div class="card-image">
      <img src="${product.main_image_url || 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 400 300%22%3E%3Crect fill=%22%23f0f3f7%22 width=%22400%22 height=%22300%22/%3E%3Ctext fill=%22%2394a3b8%22 x=%2250%25%22 y=%2250%25%22 text-anchor=%22middle%22 dy=%22.3em%22%3EНет изображения%3C/text%3E%3C/svg%3E'}" 
           alt="${escapeHtml(product.name)}"
           loading="lazy">
    </div>
    
    <div class="card-content">
      <div class="like-wrapper">
        <button class="like-btn" data-id="${product.id}" aria-label="Лайк">
          ❤️
        </button>
        <span class="like-count" data-like-count="${product.id}">${product.likes_count || 0}</span>
      </div>
      
      <h3 class="product-title" title="${escapeHtml(product.name)}">${escapeHtml(product.name)}</h3>
      
      ${product.brand_name ? `<p class="product-brand">${escapeHtml(product.brand_name)}</p>` : ''}
      
      <div class="price-row">
        <span class="current-price">${formatPrice(product.price)}</span>
        ${product.old_price ? `<span class="old-price">${formatPrice(product.old_price)}</span>` : ''}
      </div>
      
      <div class="rating-mini">
        <span class="stars">${stars}</span>
        <span class="rating-value">${product.rating?.toFixed(1) || 'N/A'}</span>
        ${product.reviews_count ? `<span class="reviews-count">(${product.reviews_count})</span>` : ''}
      </div>
      
      <div class="action-buttons">
        <button class="btn-primary" data-action="view" data-id="${product.id}">
          Просмотр
        </button>
        <button class="btn-secondary" data-action="cart" data-id="${product.id}">
          В корзину
        </button>
      </div>
    </div>
  `;

  return card;
}

/**
 * Обновление счётчика лайков на карточке
 */
export function updateProductLikeCount(productId, count) {
  const countElement = document.querySelector(`[data-like-count="${productId}"]`);
  if (countElement) {
    countElement.textContent = count;
  }
}

/**
 * Обновление состояния кнопки лайка
 */
export function updateLikeButtonState(productId, isLiked) {
  const btn = document.querySelector(`.like-btn[data-id="${productId}"]`);
  if (btn) {
    btn.classList.toggle('liked', isLiked);
    btn.style.opacity = isLiked ? '1' : '0.7';
  }
}

/**
 * Skeleton для загрузки карточки
 */
export function createProductCardSkeleton() {
  const skeleton = document.createElement('div');
  skeleton.className = 'product-card skeleton';
  skeleton.innerHTML = `
    <div class="card-image skeleton-bg"></div>
    <div class="card-content">
      <div class="skeleton-text" style="width: 60%; height: 20px;"></div>
      <div class="skeleton-text" style="width: 40%; height: 16px; margin-top: 8px;"></div>
      <div class="skeleton-text" style="width: 50%; height: 24px; margin-top: 12px;"></div>
      <div class="skeleton-text" style="width: 80%; height: 16px; margin-top: 8px;"></div>
      <div class="action-buttons" style="margin-top: 16px;">
        <div class="skeleton-bg" style="flex: 1; height: 36px; border-radius: 18px;"></div>
        <div class="skeleton-bg" style="flex: 1; height: 36px; border-radius: 18px; margin-left: 8px;"></div>
      </div>
    </div>
  `;
  return skeleton;
}

/**
 * Пустое состояние каталога
 */
export function createEmptyState(message = 'Товары не найдены') {
  const empty = document.createElement('div');
  empty.className = 'no-products';
  empty.innerHTML = `
    <div class="empty-icon">📦</div>
    <h3>${escapeHtml(message)}</h3>
    <p>Попробуйте изменить параметры поиска или фильтры</p>
  `;
  return empty;
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
