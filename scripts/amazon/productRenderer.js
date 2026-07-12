import { formatCurrency } from '../utils/money.js';
import { getDiscountDetails } from '../shared/productPricing.js';
import { handleImageError } from '../shared/imageFallback.js';
import { SKELETON_COUNT } from '../shared/constants.js';

export function highlightText(text, query) {
  if (!query?.trim()) {
    return text;
  }

  const cleanQuery = query.trim();
  const escapedQuery = cleanQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escapedQuery})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

export function renderSkeletons(productsGrid) {
  let skeletonHTML = '';

  for (let i = 0; i < SKELETON_COUNT; i++) {
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

function buildQuantityOptions(productId) {
  let optionsHTML = '';

  for (let quantity = 1; quantity <= 10; quantity++) {
    const selected = quantity === 1 ? 'selected' : '';
    optionsHTML += `<option ${selected} value="${quantity}">${quantity}</option>`;
  }

  return optionsHTML;
}

export function renderProductsGrid({
  productsGrid,
  filteredProducts,
  favorites,
  searchQuery,
  onAddToCart,
  onFavoriteToggle,
  onQuickView,
}) {
  let productsHTML = '';

  filteredProducts.forEach((product) => {
    const { discountPercent, originalPriceCents } = getDiscountDetails(product.priceCents);
    const isFavorite = favorites.includes(product.id);

    productsHTML += `
      <div class="product-container">
        <span class="discount-badge">${discountPercent}% OFF</span>

        <button class="favorite-btn js-favorite-btn ${isFavorite ? 'active' : ''}"
          data-product-id="${product.id}" aria-label="Add to favorites">❤️</button>

        <div class="product-image-container">
          <img class="product-image" src="${product.image}" loading="lazy"
            alt="${product.name}">
          <button class="quick-view-btn js-quick-view" data-product-id="${product.id}">
            Quick View
          </button>
        </div>

        <div class="product-name limit-text-to-2-lines">
          ${highlightText(product.name, searchQuery)}
        </div>

        <div class="product-rating-container">
          <img class="product-rating-stars"
            src="images/ratings/rating-${product.rating.stars * 10}.png"
            alt="${product.rating.stars} stars">
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
            ${buildQuantityOptions(product.id)}
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

  productsGrid.querySelectorAll('.product-image').forEach((image) => {
    image.addEventListener('error', handleImageError);
  });

  productsGrid.querySelectorAll('.js-add-to-cart').forEach((button) => {
    button.addEventListener('click', () => onAddToCart(button.dataset.productId));
  });

  productsGrid.querySelectorAll('.js-favorite-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      onFavoriteToggle(button.dataset.productId, button);
    });
  });

  productsGrid.querySelectorAll('.js-quick-view').forEach((button) => {
    button.addEventListener('click', () => onQuickView(button.dataset.productId));
  });
}
