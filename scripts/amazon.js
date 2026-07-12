import {cart, addToCart} from '../data/cart.js';
import {products} from '../data/products.js';
import {formatCurrency} from './utils/money.js';

// Cache DOM Elements
const searchInput = document.querySelector('.js-search-bar');
const clearBtn = document.querySelector('.js-clear-search-button');
const searchBtn = document.querySelector('.js-search-button');
const dropdownElement = document.querySelector('.js-search-dropdown');
const resultsHeader = document.querySelector('.js-search-results-header');
const loadingContainer = document.querySelector('.js-loading-container');
const noProductsContainer = document.querySelector('.js-no-products-container');
const productsGrid = document.querySelector('.js-products-grid');
const clearSearchBtn = document.querySelector('.js-clear-search-btn');

// redone navigation controls cache
const navCategorySelect = document.querySelector('.js-nav-category-select');
const filterCategorySelect = document.querySelector('.js-filter-category');
const filterPriceSelect = document.querySelector('.js-filter-price');
const filterSortSelect = document.querySelector('.js-filter-sort');
const clearFiltersBtn = document.querySelector('.js-clear-filters-btn');
const scrollToTopBtn = document.querySelector('.js-scroll-to-top');
const backToTopFooter = document.querySelector('.js-back-to-top-footer');
const quickviewModal = document.querySelector('.js-quickview-modal');
const quickviewClose = document.querySelector('.js-quickview-close');
const quickviewOverlay = document.querySelector('.js-quickview-overlay');

// Global Filter State
let searchQuery = localStorage.getItem('lastSearch') || '';
let selectedCategory = 'all';
let priceRange = 'all';
let sortBy = 'featured';

// Recent searches & Favorites lists
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

// Active timeouts mapping for cart labels
const addedMessageTimeouts = {};

/* ==========================================================================
   Category Mapping Logic
   ========================================================================== */
function getProductCategory(product) {
  if (product.type === 'clothing' || (product.keywords && product.keywords.some(k => 
    ['apparel', 'socks', 'tshirts', 'sweaters', 'hoodies', 'shorts', 'shoes', 'footwear', 'sandals', 'hats', 'swimwear'].includes(k.toLowerCase())
  ))) {
    return 'clothing';
  }
  if (product.keywords && product.keywords.some(k => 
    ['appliances', 'toaster', 'coffeemaker', 'blender', 'kettle', 'kitchen', 'dining', 'plates', 'cookware', 'knives', 'mugs'].includes(k.toLowerCase())
  )) {
    return 'kitchen';
  }
  if (product.keywords && product.keywords.some(k => 
    ['sports', 'basketballs', 'fitness', 'golf', 'polo', 'gym'].includes(k.toLowerCase())
  )) {
    return 'sports';
  }
  if (product.keywords && product.keywords.some(k => 
    ['bedroom', 'bathroom', 'home', 'curtains', 'towels', 'bathmat', 'rug', 'laundry', 'cleaning', 'tissue', 'napkins'].includes(k.toLowerCase())
  )) {
    return 'home';
  }
  if (product.keywords && product.keywords.some(k => 
    ['accessories', 'shades', 'jewelry', 'earrings', 'sunglasses', 'watch', 'backpack', 'umbrella'].includes(k.toLowerCase())
  )) {
    return 'accessories';
  }
  if (product.keywords && product.keywords.some(k => 
    ['electronics', 'headphones', 'chargers', 'speakers', 'mouse', 'gaming'].includes(k.toLowerCase())
  )) {
    return 'electronics';
  }
  return 'other';
}

/* ==========================================================================
   Filter & Sorting Logic
   ========================================================================== */
function filterAndSortProducts() {
  let filtered = [...products];

  // 1. Search Query filter (checks name, keywords, category type)
  const cleanQuery = searchQuery.trim().toLowerCase();
  if (cleanQuery) {
    filtered = filtered.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(cleanQuery);
      const keywordMatch = product.keywords && product.keywords.some(k => k.toLowerCase().includes(cleanQuery));
      const typeMatch = product.type && product.type.toLowerCase().includes(cleanQuery);
      return nameMatch || keywordMatch || typeMatch;
    });
  }

  // 2. Category filter
  if (selectedCategory !== 'all') {
    filtered = filtered.filter((product) => {
      return getProductCategory(product) === selectedCategory;
    });
  }

  // 3. Price filter
  if (priceRange !== 'all') {
    filtered = filtered.filter((product) => {
      const dollars = product.priceCents / 100;
      if (priceRange === 'under-20') return dollars < 20;
      if (priceRange === '20-50') return dollars >= 20 && dollars <= 50;
      if (priceRange === '50-100') return dollars >= 50 && dollars <= 100;
      if (priceRange === 'above-100') return dollars > 100;
      return true;
    });
  }

  // 4. Sorting
  if (sortBy === 'price-asc') {
    filtered.sort((a, b) => a.priceCents - b.priceCents);
  } else if (sortBy === 'price-desc') {
    filtered.sort((a, b) => b.priceCents - a.priceCents);
  } else if (sortBy === 'rating-desc') {
    filtered.sort((a, b) => b.rating.stars - a.rating.stars || b.rating.count - a.rating.count);
  } else if (sortBy === 'best-selling') {
    filtered.sort((a, b) => b.rating.count - a.rating.count);
  } else if (sortBy === 'name-asc') {
    filtered.sort((a, b) => a.name.localeCompare(b.name));
  }

  return filtered;
}

/* ==========================================================================
   Render & View Components
   ========================================================================== */
function renderSkeletons() {
  let skeletonHTML = '';
  for (let i = 0; i < 8; i++) {
    skeletonHTML += `
      <div class="product-container skeleton-card">
        <div class="skeleton skeleton-image"></div>
        <div class="skeleton skeleton-text"></div>
        <div class="skeleton skeleton-text short"></div>
        <div class="skeleton skeleton-rating"></div>
        <div class="skeleton skeleton-price"></div>
        <div class="skeleton skeleton-button"></div>
      </div>`;
  }
  productsGrid.innerHTML = skeletonHTML;
}

function renderProductsGrid(filteredProducts) {
  let productsHTML = '';

  filteredProducts.forEach((product) => {
    // Generate original price and discount details
    const discountPercent = (product.priceCents % 3) * 10 + 10; // Gives 10%, 20% or 30% discount
    const originalPriceCents = Math.round(product.priceCents / (1 - discountPercent / 100));
    const isFavorite = favorites.includes(product.id);

    productsHTML += `
      <div class="product-container">
        <!-- Discount Badge -->
        <span class="discount-badge">${discountPercent}% OFF</span>

        <!-- Favorite heart button -->
        <button class="favorite-btn js-favorite-btn ${isFavorite ? 'active' : ''}" 
          data-product-id="${product.id}" aria-label="Add to favorites">❤️</button>

        <div class="product-image-container">
          <img class="product-image" src="${product.image}" loading="lazy" alt="${product.name}">
          <!-- Quick View Hover button -->
          <button class="quick-view-btn js-quick-view" data-product-id="${product.id}">Quick View</button>
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${highlightText(product.name, searchQuery)}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
            src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars">
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price-container">
          <span class="product-price">$${formatCurrency(product.priceCents)}</span>
          <span class="original-price">$${formatCurrency(originalPriceCents)}</span>
        </div>

        <div class="product-quantity-container">
          <select class="js-quantity-selector-${product.id}">
            <option selected value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4</option>
            <option value="5">5</option>
            <option value="6">6</option>
            <option value="7">7</option>
            <option value="8">8</option>
            <option value="9">9</option>
            <option value="10">10</option>
          </select>
        </div>

        <div class="product-spacer"></div>

        <div class="added-to-cart js-added-to-cart-${product.id}">
          <img src="images/icons/checkmark.png" alt="Success">
          Added
        </div>

        <button class="add-to-cart-button js-add-to-cart"
          data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>`;
  });

  productsGrid.innerHTML = productsHTML;
  setupAddToCartListeners();
  setupProductCardActions();
}

function highlightText(text, query) {
  if (!query || !query.trim()) return text;
  const cleanQuery = query.trim();
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/* ==========================================================================
   State Synchronization & Redirection
   ========================================================================== */
function performFilterAndRender(showSkeleton = true) {
  // Sync category selects
  navCategorySelect.value = selectedCategory;
  filterCategorySelect.value = selectedCategory;
  filterPriceSelect.value = priceRange;
  filterSortSelect.value = sortBy;

  // Sync category cards highlight
  document.querySelectorAll('.js-category-card').forEach((card) => {
    if (card.dataset.category === selectedCategory) {
      card.classList.add('active');
    } else {
      card.classList.remove('active');
    }
  });

  // Toggle "Clear Filters" button
  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'all' || priceRange !== 'all' || sortBy !== 'featured';
  if (hasActiveFilters) {
    clearFiltersBtn.classList.remove('hidden');
  } else {
    clearFiltersBtn.classList.add('hidden');
  }

  // Handle Loading Skeletons
  if (showSkeleton) {
    renderSkeletons();
    noProductsContainer.classList.add('hidden');
    resultsHeader.classList.add('hidden');
    productsGrid.style.display = 'grid';
  }

  setTimeout(() => {
    const filtered = filterAndSortProducts();

    // Hide skeletons
    loadingContainer.classList.add('hidden');

    // Update Result counts
    if (searchQuery.trim() !== '') {
      resultsHeader.innerHTML = `Results for "${searchQuery}" (${filtered.length} product${filtered.length !== 1 ? 's' : ''})`;
      resultsHeader.classList.remove('hidden');
    } else if (selectedCategory !== 'all' || priceRange !== 'all') {
      resultsHeader.innerHTML = `Filtered Results (${filtered.length} product${filtered.length !== 1 ? 's' : ''})`;
      resultsHeader.classList.remove('hidden');
    } else {
      resultsHeader.classList.add('hidden');
    }

    // Toggle grid vs empty state
    if (filtered.length === 0) {
      noProductsContainer.classList.remove('hidden');
      productsGrid.style.display = 'none';
    } else {
      noProductsContainer.classList.add('hidden');
      productsGrid.style.display = 'grid';
      renderProductsGrid(filtered);
    }
  }, showSkeleton ? 300 : 0);
}

/* ==========================================================================
   Event Listeners Setup
   ========================================================================== */
function setupAddToCartListeners() {
  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = quantitySelector ? Number(quantitySelector.value) : 1;

      addToCart(productId, quantity);
      updateCartQuantity();

      // Find product details for toast
      const product = products.find(p => p.id === productId);
      if (product) {
        showToast(product.name, product.image);
      }

      // Show inline feedback label
      const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
      if (addedMessage) {
        addedMessage.style.opacity = '1';
        if (addedMessageTimeouts[productId]) {
          clearTimeout(addedMessageTimeouts[productId]);
        }
        addedMessageTimeouts[productId] = setTimeout(() => {
          addedMessage.style.opacity = '0';
        }, 2000);
      }
    });
  });
}

function setupProductCardActions() {
  // Bind Favorite buttons
  document.querySelectorAll('.js-favorite-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const productId = btn.dataset.productId;
      if (favorites.includes(productId)) {
        favorites = favorites.filter(id => id !== productId);
        btn.classList.remove('active');
      } else {
        favorites.push(productId);
        btn.classList.add('active');
      }
      localStorage.setItem('favorites', JSON.stringify(favorites));
    });
  });

  // Bind Quick View Buttons
  document.querySelectorAll('.js-quick-view').forEach((btn) => {
    btn.addEventListener('click', () => {
      const productId = btn.dataset.productId;
      openQuickView(productId);
    });
  });
}

/* ==========================================================================
   Recent Searches Dropdown
   ========================================================================== */
function addToRecentSearches(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  recentSearches = recentSearches.filter(s => s.toLowerCase() !== cleanQuery.toLowerCase());
  recentSearches.unshift(cleanQuery);

  if (recentSearches.length > 5) {
    recentSearches.pop();
  }

  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  renderDropdown();
}

function renderDropdown() {
  if (recentSearches.length === 0) {
    dropdownElement.classList.add('hidden');
    return;
  }

  let html = '';
  recentSearches.forEach((item, index) => {
    html += `
      <div class="dropdown-item js-dropdown-item" data-index="${index}" data-query="${item}">
        <div class="dropdown-item-text">
          <span class="dropdown-item-icon"></span>
          <span>${item}</span>
        </div>
        <button class="remove-recent-button js-remove-recent" data-index="${index}">&times;</button>
      </div>`;
  });

  dropdownElement.innerHTML = html;

  dropdownElement.querySelectorAll('.js-dropdown-item').forEach((item) => {
    item.addEventListener('mousedown', () => {
      const query = item.dataset.query;
      searchInput.value = query;
      clearBtn.classList.remove('hidden');
      searchQuery = query;
      localStorage.setItem('lastSearch', query);
      performFilterAndRender(true);
    });
  });

  dropdownElement.querySelectorAll('.js-remove-recent').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => {
      e.stopPropagation();
      e.preventDefault();
      const index = Number(btn.dataset.index);
      recentSearches.splice(index, 1);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      renderDropdown();
      searchInput.focus();
    });
  });
}

/* ==========================================================================
   Quick View Modal Actions
   ========================================================================== */
function openQuickView(productId) {
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const discountPercent = (product.priceCents % 3) * 10 + 10;
  const originalPriceCents = Math.round(product.priceCents / (1 - discountPercent / 100));

  const modalBody = document.querySelector('.js-quickview-body');
  modalBody.innerHTML = `
    <div class="quickview-grid">
      <div class="qv-image-container">
        <img src="${product.image}" alt="${product.name}">
      </div>
      <div class="qv-details">
        <h2 class="qv-title">${product.name}</h2>
        <div class="product-rating-container" style="margin-bottom:15px;">
          <img class="product-rating-stars" src="images/ratings/rating-${product.rating.stars * 10}.png" alt="${product.rating.stars} stars">
          <span class="product-rating-count link-primary" style="margin-top:2px; font-size:13px;">${product.rating.count} ratings</span>
        </div>
        
        <div class="product-price-container" style="margin-bottom:15px;">
          <span class="product-price" style="font-size:22px;">$${formatCurrency(product.priceCents)}</span>
          <span class="original-price" style="font-size:15px;">$${formatCurrency(originalPriceCents)}</span>
        </div>

        <p class="qv-desc">Upgrade your collection with this high-quality product. Crafted with premium components for durability, ease of use, and style. Guaranteed to meet your daily needs.</p>

        <div style="margin-top: 15px; display: flex; align-items: center; gap: 15px;">
          <div>
            <label style="font-size:14px; font-weight:600; margin-right:8px;">Qty:</label>
            <select class="js-qv-quantity" style="padding:5px; border-radius:4px; border:1px solid #ccc; background:#fafafa;">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
            </select>
          </div>
          <button class="add-to-cart-button js-qv-add-to-cart" data-product-id="${product.id}" style="width: auto; padding: 10px 25px;">
            Add to Cart
          </button>
        </div>
      </div>
    </div>`;

  modalBody.querySelector('.js-qv-add-to-cart').addEventListener('click', () => {
    const qty = Number(modalBody.querySelector('.js-qv-quantity').value);
    addToCart(product.id, qty);
    updateCartQuantity();
    showToast(product.name, product.image);
    closeQuickView();
  });

  quickviewModal.classList.remove('hidden');
}

function closeQuickView() {
  quickviewModal.classList.add('hidden');
}

/* ==========================================================================
   Toast Notification component
   ========================================================================== */
function showToast(message, imageUrl) {
  const toastContainer = document.querySelector('.js-toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast-notification';
  toast.innerHTML = `
    <img src="${imageUrl}" alt="product">
    <div class="toast-content">
      <span class="toast-title">Added to Cart!</span>
      <span class="toast-msg">${message}</span>
    </div>`;

  toastContainer.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 10);

  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/* ==========================================================================
   Update Cart badge
   ========================================================================== */
function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

/* ==========================================================================
   Core Event Subscriptions
   ========================================================================== */

// Debounce helper
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleInputDebounced = debounce((val) => {
  searchQuery = val;
  performFilterAndRender(true);
}, 300);

// Search Bar Input Events
searchInput.addEventListener('input', () => {
  const val = searchInput.value;
  if (val) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  handleInputDebounced(val);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const val = searchInput.value;
    searchQuery = val;
    addToRecentSearches(val);
    performFilterAndRender(true);
    searchInput.blur();
  }
});

searchInput.addEventListener('focus', () => {
  if (recentSearches.length > 0) {
    renderDropdown();
    dropdownElement.classList.remove('hidden');
  }
});

searchInput.addEventListener('blur', () => {
  setTimeout(() => dropdownElement.classList.add('hidden'), 200);
});

clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  searchQuery = '';
  localStorage.setItem('lastSearch', '');
  performFilterAndRender(true);
  searchInput.focus();
});

searchBtn.addEventListener('click', () => {
  const val = searchInput.value;
  searchQuery = val;
  addToRecentSearches(val);
  performFilterAndRender(true);
});

// Category cards selection (Shop by Category grid)
document.querySelectorAll('.js-category-card').forEach((card) => {
  card.addEventListener('click', () => {
    const cat = card.dataset.category;
    if (selectedCategory === cat) {
      selectedCategory = 'all'; // toggle off
    } else {
      selectedCategory = cat;
    }
    performFilterAndRender(true);
    document.querySelector('#products-section').scrollIntoView({ behavior: 'smooth' });
  });
});

// Toolbar Dropdown events
navCategorySelect.addEventListener('change', () => {
  selectedCategory = navCategorySelect.value;
  performFilterAndRender(true);
  document.querySelector('#products-section').scrollIntoView({ behavior: 'smooth' });
});

filterCategorySelect.addEventListener('change', () => {
  selectedCategory = filterCategorySelect.value;
  performFilterAndRender(true);
});

filterPriceSelect.addEventListener('change', () => {
  priceRange = filterPriceSelect.value;
  performFilterAndRender(true);
});

filterSortSelect.addEventListener('change', () => {
  sortBy = filterSortSelect.value;
  performFilterAndRender(true);
});

// Clear Filters button
const clearAllFilters = () => {
  searchQuery = '';
  selectedCategory = 'all';
  priceRange = 'all';
  sortBy = 'featured';
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  localStorage.setItem('lastSearch', '');
  performFilterAndRender(true);
};

clearFiltersBtn.addEventListener('click', clearAllFilters);
clearSearchBtn.addEventListener('click', clearAllFilters);

// Hero shop now button
document.querySelector('.js-hero-shop-now').addEventListener('click', () => {
  document.querySelector('#products-section').scrollIntoView({ behavior: 'smooth' });
});

// Header scroll color and shadow toggle
window.addEventListener('scroll', () => {
  const header = document.querySelector('.amazon-header');
  if (window.scrollY > 15) {
    header.classList.add('scrolled');
  } else {
    header.classList.remove('scrolled');
  }

  // Scroll to Top float button visibility
  if (window.scrollY > 500) {
    scrollToTopBtn.classList.remove('hidden');
  } else {
    scrollToTopBtn.classList.add('hidden');
  }
});

// Scroll to top clicks
scrollToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

backToTopFooter.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Modal close actions
quickviewClose.addEventListener('click', closeQuickView);
quickviewOverlay.addEventListener('click', closeQuickView);
window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeQuickView();
});

/* ==========================================================================
   Init State
   ========================================================================== */
updateCartQuantity();
if (searchQuery) {
  searchInput.value = searchQuery;
  clearBtn.classList.remove('hidden');
}
performFilterAndRender(true);