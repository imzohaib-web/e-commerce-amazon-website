import { products } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import { getDiscountDetails } from '../shared/productPricing.js';
import { handleImageError } from '../shared/imageFallback.js';
import { showToast } from '../shared/toast.js';
import { updateCartBadge } from '../shared/cartBadge.js';

export function createQuickViewModal({
  modalElement,
  modalBodyElement,
  closeButton,
  overlayElement,
  addToCart,
}) {
  function closeQuickView() {
    modalElement.classList.add('hidden');
  }

  function openQuickView(productId) {
    const product = products.find((item) => item.id === productId);
    if (!product) {
      return;
    }

    const { originalPriceCents } = getDiscountDetails(product.priceCents);

    modalBodyElement.innerHTML = `
      <div class="quickview-grid">
        <div class="qv-image-container">
          <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="qv-details">
          <h2 class="qv-title">${product.name}</h2>
          <div class="product-rating-container qv-rating">
            <img class="product-rating-stars"
              src="images/ratings/rating-${product.rating.stars * 10}.png"
              alt="${product.rating.stars} stars">
            <span class="product-rating-count link-primary qv-rating-count">
              ${product.rating.count} ratings
            </span>
          </div>

          <div class="product-price-container qv-price">
            <span class="product-price">$${formatCurrency(product.priceCents)}</span>
            <span class="original-price">$${formatCurrency(originalPriceCents)}</span>
          </div>

          <p class="qv-desc">
            Upgrade your collection with this high-quality product. Crafted with premium
            components for durability, ease of use, and style. Guaranteed to meet your daily needs.
          </p>

          <div class="qv-actions">
            <div>
              <label class="qv-quantity-label">Qty:</label>
              <select class="js-qv-quantity qv-quantity-select">
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
              </select>
            </div>
            <button class="add-to-cart-button js-qv-add-to-cart qv-add-button"
              data-product-id="${product.id}">
              Add to Cart
            </button>
          </div>
        </div>
      </div>`;

    const quickViewImage = modalBodyElement.querySelector('img');
    if (quickViewImage) {
      quickViewImage.addEventListener('error', handleImageError);
    }

    modalBodyElement.querySelector('.js-qv-add-to-cart').addEventListener('click', () => {
      const quantity = Number(modalBodyElement.querySelector('.js-qv-quantity').value);
      addToCart(product.id, quantity);
      updateCartBadge();
      showToast(product.name, product.image);
      closeQuickView();
    });

    modalElement.classList.remove('hidden');
  }

  closeButton.addEventListener('click', closeQuickView);
  overlayElement.addEventListener('click', closeQuickView);
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeQuickView();
    }
  });

  return { openQuickView, closeQuickView };
}
