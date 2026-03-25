/**
 * Filters Component
 * Компонент фильтров и сортировки
 */

import { debounce } from '../utils.js';

/**
 * Создание панели фильтров
 */
export function createFiltersContainer(options = {}) {
  const container = document.createElement('div');
  container.className = 'filters';
  container.innerHTML = `
    <div class="filter-group">
      <label for="search">🔍 Поиск</label>
      <input 
        type="text" 
        id="search" 
        placeholder="Название или бренд..."
        value="${options.search || ''}"
        autocomplete="off">
    </div>
    
    <div class="filter-group">
      <label for="category">📁 Категория</label>
      <select id="category">
        <option value="all">Все категории</option>
        ${options.categories?.map(cat => 
          `<option value="${cat.slug}" ${cat.slug === options.category ? 'selected' : ''}>${cat.name}</option>`
        ).join('') || ''}
      </select>
    </div>
    
    <div class="filter-group">
      <label for="sort">⚡ Сортировка</label>
      <select id="sort">
        <option value="default" ${options.sortBy === 'default' ? 'selected' : ''}>По умолчанию</option>
        <option value="price-asc" ${options.sortBy === 'price-asc' ? 'selected' : ''}>Цена ↑</option>
        <option value="price-desc" ${options.sortBy === 'price-desc' ? 'selected' : ''}>Цена ↓</option>
        <option value="likes-desc" ${options.sortBy === 'likes-desc' ? 'selected' : ''}>Лайки ↓</option>
        <option value="rating-desc" ${options.sortBy === 'rating-desc' ? 'selected' : ''}>Рейтинг ↓</option>
        <option value="newest" ${options.sortBy === 'newest' ? 'selected' : ''}>Новинки</option>
      </select>
    </div>
    
    <button class="reset-btn" id="resetFilters">Сбросить</button>
  `;

  return container;
}

/**
 * Инициализация обработчиков фильтров
 */
export function initFiltersHandlers(callbacks) {
  const searchInput = document.getElementById('search');
  const categorySelect = document.getElementById('category');
  const sortSelect = document.getElementById('sort');
  const resetBtn = document.getElementById('resetFilters');

  // Debounce для поиска (300мс)
  const debouncedSearch = debounce((value) => {
    if (callbacks.onSearch) callbacks.onSearch(value);
  }, 300);

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      debouncedSearch(e.target.value);
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      if (callbacks.onCategory) callbacks.onCategory(e.target.value);
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      if (callbacks.onSort) callbacks.onSort(e.target.value);
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (callbacks.onReset) callbacks.onReset();
    });
  }
}

/**
 * Обновление доступных категорий в фильтре
 */
export function updateCategoryOptions(categories, selectedCategory = 'all') {
  const select = document.getElementById('category');
  if (!select) return;

  const currentValue = select.value;
  
  select.innerHTML = `
    <option value="all">Все категории</option>
    ${categories.map(cat => 
      `<option value="${cat.slug}" ${cat.slug === selectedCategory ? 'selected' : ''}>${cat.name}</option>`
    ).join('')}
  `;

  // Сохраняем текущее значение
  select.value = currentValue || selectedCategory;
}

/**
 * Получение текущих значений фильтров
 */
export function getFiltersValues() {
  return {
    search: document.getElementById('search')?.value || '',
    category: document.getElementById('category')?.value || 'all',
    sortBy: document.getElementById('sort')?.value || 'default',
  };
}

/**
 * Установка значений фильтров
 */
export function setFiltersValues(filters) {
  if (filters.search !== undefined) {
    const searchInput = document.getElementById('search');
    if (searchInput) searchInput.value = filters.search;
  }
  
  if (filters.category !== undefined) {
    const categorySelect = document.getElementById('category');
    if (categorySelect) categorySelect.value = filters.category;
  }
  
  if (filters.sortBy !== undefined) {
    const sortSelect = document.getElementById('sort');
    if (sortSelect) sortSelect.value = filters.sortBy;
  }
}
