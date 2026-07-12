import { addToCart } from '../data/cart.js';
import { products } from '../data/products.js';
import { updateCartBadge } from './shared/cartBadge.js';
import { debounce } from './shared/debounce.js';
import { showToast } from './shared/toast.js';
import {
  initBackToTopFooter,
  initScrollToTopButton,
} from './shared/scrollToTop.js';
import {
  setStringToStorage,
  setJsonToStorage,
} from './shared/storage.js';
import {
  STORAGE_KEYS,
  RENDER_DELAY_MS,
  ADDED_TO_CART_FEEDBACK_MS,
  SCROLL_TO_TOP_THRESHOLD,
  HEADER_SCROLL_THRESHOLD,
} from './shared/constants.js';

import {
  filterState,
  favorites,
  resetFilterState,
  hasActiveFilters,
  setFavorites,
} from './amazon/filterState.js';
import { filterAndSortProducts } from './amazon/productFilters.js';
import {
  renderSkeletons,
  renderProductsGrid,
} from './amazon/productRenderer.js';
import { createRecentSearchManager } from './amazon/recentSearch.js';
import { createQuickViewModal } from './amazon/quickView.js';

const dom = {
  searchInput: document.querySelector('.js-search-bar'),
  clearButton: document.querySelector('.js-clear-search-button'),
  searchButton: document.querySelector('.js-search-button'),
  dropdownElement: document.querySelector('.js-search-dropdown'),
  resultsHeader: document.querySelector('.js-search-results-header'),
  noProductsContainer: document.querySelector('.js-no-products-container'),
  productsGrid: document.querySelector('.js-products-grid'),
  clearSearchButton: document.querySelector('.js-clear-search-btn'),
  navCategorySelect: document.querySelector('.js-nav-category-select'),
  filterCategorySelect: document.querySelector('.js-filter-category'),
  filterPriceSelect: document.querySelector('.js-filter-price'),
  filterSortSelect: document.querySelector('.js-filter-sort'),
  clearFiltersButton: document.querySelector('.js-clear-filters-btn'),
  header: document.querySelector('.amazon-header'),
  quickviewModal: document.querySelector('.js-quickview-modal'),
  quickviewClose: document.querySelector('.js-quickview-close'),
  quickviewOverlay: document.querySelector('.js-quickview-overlay'),
  quickviewBody: document.querySelector('.js-quickview-body'),
  heroShopNowButton: document.querySelector('.js-hero-shop-now'),
  productsSection: document.querySelector('#products-section'),
};

const addedMessageTimeouts = {};

const recentSearchManager = createRecentSearchManager({
  dropdownElement: dom.dropdownElement,
  searchInput: dom.searchInput,
  clearButton: dom.clearButton,
  onSearchSelect: (query) => {
    filterState.searchQuery = query;
    performFilterAndRender(true);
  },
});

const quickView = createQuickViewModal({
  modalElement: dom.quickviewModal,
  modalBodyElement: dom.quickviewBody,
  closeButton: dom.quickviewClose,
  overlayElement: dom.quickviewOverlay,
  addToCart,
});

function syncFilterControls() {
  dom.navCategorySelect.value = filterState.selectedCategory;
  dom.filterCategorySelect.value = filterState.selectedCategory;
  dom.filterPriceSelect.value = filterState.priceRange;
  dom.filterSortSelect.value = filterState.sortBy;

  if (hasActiveFilters()) {
    dom.clearFiltersButton.classList.remove('hidden');
  } else {
    dom.clearFiltersButton.classList.add('hidden');
  }
}

function updateResultsHeader(filteredCount) {
  const { searchQuery, selectedCategory, priceRange } = filterState;

  if (searchQuery.trim()) {
    dom.resultsHeader.innerHTML =
      `Results for "${searchQuery}" (${filteredCount} product${filteredCount !== 1 ? 's' : ''})`;
    dom.resultsHeader.classList.remove('hidden');
  } else if (selectedCategory !== 'all' || priceRange !== 'all') {
    dom.resultsHeader.innerHTML =
      `Filtered Results (${filteredCount} product${filteredCount !== 1 ? 's' : ''})`;
    dom.resultsHeader.classList.remove('hidden');
  } else {
    dom.resultsHeader.classList.add('hidden');
  }
}

function performFilterAndRender(showSkeleton = true) {
  syncFilterControls();

  if (showSkeleton) {
    renderSkeletons(dom.productsGrid);
    dom.noProductsContainer.classList.add('hidden');
    dom.resultsHeader.classList.add('hidden');
    dom.productsGrid.style.display = 'grid';
  }

  setTimeout(() => {
    const filteredProducts = filterAndSortProducts();
    updateResultsHeader(filteredProducts.length);

    if (filteredProducts.length === 0) {
      dom.noProductsContainer.classList.remove('hidden');
      dom.productsGrid.style.display = 'none';
      return;
    }

    dom.noProductsContainer.classList.add('hidden');
    dom.productsGrid.style.display = 'grid';
    renderProductsGrid({
      productsGrid: dom.productsGrid,
      filteredProducts,
      favorites,
      searchQuery: filterState.searchQuery,
      onAddToCart: handleAddToCart,
      onFavoriteToggle: handleFavoriteToggle,
      onQuickView: quickView.openQuickView,
    });
  }, showSkeleton ? RENDER_DELAY_MS : 0);
}

function handleAddToCart(productId) {
  const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
  const quantity = quantitySelector ? Number(quantitySelector.value) : 1;

  addToCart(productId, quantity);
  updateCartBadge();

  const product = products.find((item) => item.id === productId);
  if (product) {
    showToast(product.name, product.image);
  }

  const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
  if (!addedMessage) {
    return;
  }

  addedMessage.style.opacity = '1';
  if (addedMessageTimeouts[productId]) {
    clearTimeout(addedMessageTimeouts[productId]);
  }
  addedMessageTimeouts[productId] = setTimeout(() => {
    addedMessage.style.opacity = '0';
  }, ADDED_TO_CART_FEEDBACK_MS);
}

function handleFavoriteToggle(productId, button) {
  let nextFavorites;

  if (favorites.includes(productId)) {
    nextFavorites = favorites.filter((id) => id !== productId);
    button.classList.remove('active');
  } else {
    nextFavorites = [...favorites, productId];
    button.classList.add('active');
  }

  setFavorites(nextFavorites);
  setJsonToStorage(STORAGE_KEYS.FAVORITES, nextFavorites);
}

function clearAllFilters() {
  resetFilterState();
  dom.searchInput.value = '';
  dom.clearButton.classList.add('hidden');
  setStringToStorage(STORAGE_KEYS.LAST_SEARCH, '');
  performFilterAndRender(true);
}

function scrollToProductsSection() {
  dom.productsSection?.scrollIntoView({ behavior: 'smooth' });
}

const handleInputDebounced = debounce((value) => {
  filterState.searchQuery = value;
  performFilterAndRender(true);
}, 300);

dom.searchInput.addEventListener('input', () => {
  const value = dom.searchInput.value;
  dom.clearButton.classList.toggle('hidden', !value);
  handleInputDebounced(value);
});

dom.searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    filterState.searchQuery = dom.searchInput.value;
    recentSearchManager.addToRecentSearches(dom.searchInput.value);
    performFilterAndRender(true);
    dom.searchInput.blur();
  }
});

dom.searchInput.addEventListener('focus', () => {
  recentSearchManager.showDropdown();
});

dom.searchInput.addEventListener('blur', () => {
  setTimeout(() => recentSearchManager.hideDropdown(), 200);
});

dom.clearButton.addEventListener('click', () => {
  dom.searchInput.value = '';
  dom.clearButton.classList.add('hidden');
  filterState.searchQuery = '';
  setStringToStorage(STORAGE_KEYS.LAST_SEARCH, '');
  performFilterAndRender(true);
  dom.searchInput.focus();
});

dom.searchButton.addEventListener('click', () => {
  filterState.searchQuery = dom.searchInput.value;
  recentSearchManager.addToRecentSearches(dom.searchInput.value);
  performFilterAndRender(true);
});

dom.navCategorySelect.addEventListener('change', () => {
  filterState.selectedCategory = dom.navCategorySelect.value;
  performFilterAndRender(true);
  scrollToProductsSection();
});

dom.filterCategorySelect.addEventListener('change', () => {
  filterState.selectedCategory = dom.filterCategorySelect.value;
  performFilterAndRender(true);
});

dom.filterPriceSelect.addEventListener('change', () => {
  filterState.priceRange = dom.filterPriceSelect.value;
  performFilterAndRender(true);
});

dom.filterSortSelect.addEventListener('change', () => {
  filterState.sortBy = dom.filterSortSelect.value;
  performFilterAndRender(true);
});

dom.clearFiltersButton.addEventListener('click', clearAllFilters);
dom.clearSearchButton.addEventListener('click', clearAllFilters);

dom.heroShopNowButton?.addEventListener('click', scrollToProductsSection);

const scrollToTopButton = initScrollToTopButton();
initBackToTopFooter();

window.addEventListener('scroll', () => {
  dom.header?.classList.toggle('scrolled', window.scrollY > HEADER_SCROLL_THRESHOLD);
  scrollToTopButton?.classList.toggle('hidden', window.scrollY <= SCROLL_TO_TOP_THRESHOLD);
});

updateCartBadge();

if (filterState.searchQuery) {
  dom.searchInput.value = filterState.searchQuery;
  dom.clearButton.classList.remove('hidden');
}

performFilterAndRender(true);
