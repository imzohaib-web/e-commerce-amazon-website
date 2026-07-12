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

// Initialize State
let recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
let lastSearch = localStorage.getItem('lastSearch') || '';
const addedMessageTimeouts = {}; // Track timeout IDs for the "Added to cart" message

/**
 * Update the cart quantity display in the header.
 */
function updateCartQuantity() {
  let cartQuantity = 0;
  cart.forEach((cartItem) => {
    cartQuantity += cartItem.quantity;
  });
  document.querySelector('.js-cart-quantity').innerHTML = cartQuantity;
}

/**
 * Escapes special characters for use in regular expressions.
 */
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Highlight matching query parts in the text using <mark> tag while preserving original case.
 */
function highlightText(text, query) {
  if (!query || !query.trim()) return text;
  const cleanQuery = query.trim();
  const escapedQuery = escapeRegExp(cleanQuery);
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * Filter products by name, keywords, and type (category).
 */
function filterProducts(query) {
  const cleanQuery = query.trim().toLowerCase();
  if (!cleanQuery) return products;

  return products.filter((product) => {
    const matchesName = product.name.toLowerCase().includes(cleanQuery);
    const matchesKeywords = product.keywords && product.keywords.some(
      (keyword) => keyword.toLowerCase().includes(cleanQuery)
    );
    const matchesCategory = product.type && product.type.toLowerCase().includes(cleanQuery);

    return matchesName || matchesKeywords || matchesCategory;
  });
}

/**
 * Render the product grid.
 */
function renderProducts(filteredProducts, searchQuery) {
  let productsHTML = '';

  filteredProducts.forEach((product) => {
    productsHTML += `
      <div class="product-container">
        <div class="product-image-container">
          <img class="product-image" src="${product.image}">
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${highlightText(product.name, searchQuery)}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
            src="images/ratings/rating-${product.rating.stars * 10}.png">
          <div class="product-rating-count link-primary">
            ${product.rating.count}
          </div>
        </div>

        <div class="product-price">
          $${formatCurrency(product.priceCents)}
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
          <img src="images/icons/checkmark.png">
          Added
        </div>

        <button class="add-to-cart-button button-primary js-add-to-cart"
          data-product-id="${product.id}">
          Add to Cart
        </button>
      </div>`;
  });

  productsGrid.innerHTML = productsHTML;
  setupAddToCartListeners();
}

/**
 * Set up Add to Cart click handlers.
 */
function setupAddToCartListeners() {
  document.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      const quantitySelector = document.querySelector(`.js-quantity-selector-${productId}`);
      const quantity = quantitySelector ? Number(quantitySelector.value) : 1;

      addToCart(productId, quantity);
      updateCartQuantity();

      // Show "Added" checkmark animation
      const addedMessage = document.querySelector(`.js-added-to-cart-${productId}`);
      if (addedMessage) {
        addedMessage.style.opacity = '1';
        addedMessage.style.transition = 'opacity 0.2s';

        // Clear existing timeout to reset animation duration on multiple clicks
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

/**
 * Update the recent searches in state and localStorage.
 */
function addToRecentSearches(query) {
  const cleanQuery = query.trim();
  if (!cleanQuery) return;

  // Filter out any duplicate item (case-insensitive)
  recentSearches = recentSearches.filter(
    (item) => item.toLowerCase() !== cleanQuery.toLowerCase()
  );

  // Add query to the beginning of the list
  recentSearches.unshift(cleanQuery);

  // Keep maximum of 5 searches
  if (recentSearches.length > 5) {
    recentSearches.pop();
  }

  localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
  renderDropdown();
}

/**
 * Render autocomplete recent searches dropdown items.
 */
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

  // Click handler to select and perform a search from dropdown
  dropdownElement.querySelectorAll('.js-dropdown-item').forEach((item) => {
    item.addEventListener('mousedown', (e) => {
      // Use mousedown to execute query before search bar input blur fires
      const query = item.dataset.query;
      searchInput.value = query;
      clearBtn.classList.remove('hidden');
      performSearch(query, true);
      dropdownElement.classList.add('hidden');
    });
  });

  // Handler to remove search history item
  dropdownElement.querySelectorAll('.js-remove-recent').forEach((btn) => {
    btn.addEventListener('mousedown', (e) => {
      e.stopPropagation(); // Stop click propagating to dropdown selection
      e.preventDefault();  // Stop blurring searchInput
      const index = Number(btn.dataset.index);
      recentSearches.splice(index, 1);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
      renderDropdown();
      searchInput.focus();
    });
  });
}

/**
 * Performs search, updates UI states, displays matches or empty states.
 */
function performSearch(query, saveToHistory = true) {
  const cleanQuery = query.trim();
  localStorage.setItem('lastSearch', cleanQuery);

  // Hide recent searches dropdown
  dropdownElement.classList.add('hidden');

  // Toggle clear icon
  if (cleanQuery) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }

  // Show Loading Spinner State (for 300ms)
  loadingContainer.classList.remove('hidden');
  resultsHeader.classList.add('hidden');
  noProductsContainer.classList.add('hidden');
  productsGrid.classList.add('hidden');

  setTimeout(() => {
    loadingContainer.classList.add('hidden');
    const filtered = filterProducts(cleanQuery);

    if (cleanQuery === '') {
      resultsHeader.classList.add('hidden');
      noProductsContainer.classList.add('hidden');
      productsGrid.classList.remove('hidden');
    } else {
      resultsHeader.innerHTML = `Results for "${cleanQuery}" (${filtered.length} product${filtered.length !== 1 ? 's' : ''})`;
      resultsHeader.classList.remove('hidden');

      if (filtered.length === 0) {
        noProductsContainer.classList.remove('hidden');
        productsGrid.classList.add('hidden');
      } else {
        noProductsContainer.classList.add('hidden');
        productsGrid.classList.remove('hidden');
      }
    }

    renderProducts(filtered, cleanQuery);

    // Save to search history only when submitted (Enter/Click search)
    if (saveToHistory && cleanQuery !== '') {
      addToRecentSearches(cleanQuery);
    }
  }, 300);
}

/**
 * Debounce helper function.
 */
function debounce(func, delay) {
  let timeoutId;
  return function(...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

// Real-time search debounced typing handler
const handleSearchInputDebounced = debounce((query) => {
  performSearch(query, false);
}, 300);

// Set up Search Input events
searchInput.addEventListener('input', () => {
  const query = searchInput.value;
  if (query) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
  handleSearchInputDebounced(query);
});

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const query = searchInput.value;
    performSearch(query, true);
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
  // Give dropdown handlers a moment to intercept mousedown before hiding
  setTimeout(() => {
    dropdownElement.classList.add('hidden');
  }, 200);
});

// Search Button events
searchBtn.addEventListener('click', () => {
  const query = searchInput.value;
  performSearch(query, true);
});

// Clear Button events
clearBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  performSearch('', false);
  searchInput.focus();
});

clearSearchBtn.addEventListener('click', () => {
  searchInput.value = '';
  clearBtn.classList.add('hidden');
  performSearch('', false);
});

// Initial Setup on load
updateCartQuantity();
if (lastSearch) {
  searchInput.value = lastSearch;
  clearBtn.classList.remove('hidden');
  performSearch(lastSearch, false);
} else {
  renderProducts(products, '');
}