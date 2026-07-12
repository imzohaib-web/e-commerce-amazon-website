import { cart, removeFromCart, updateDeliveryOption } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { formatCurrency } from '../utils/money.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { deliveryOptions, getDeliveryOption } from '../../data/deliveryOptions.js';
import { renderPaymentSummary } from './paymentSummary.js';
import { updateCartBadge } from '../shared/cartBadge.js';
import { handleImageError } from '../shared/imageFallback.js';

function quantityOptionsHTML(currentQty) {
  let html = '';
  for (let i = 1; i <= 10; i++) {
    html += `<option value="${i}" ${currentQty === i ? 'selected' : ''}>${i}</option>`;
  }
  return html;
}

export function renderOrderSummary() {
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {
    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);

    if (!matchingProduct) {
      return; // Skip if product is not found
    }

    const deliveryOptionId = cartItem.deliveryOptionId;
    let deliveryOption = getDeliveryOption(deliveryOptionId);

    if (!deliveryOption) {
      deliveryOption = deliveryOptions[0];
    }

    const today = dayjs();
    const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML += `
      <div class="cart-item-container js-cart-item-container-${matchingProduct.id}">
        <div class="delivery-date">
          Delivery date: ${dateString}
        </div>

        <div class="cart-item-details-grid">
          <img class="product-image" src="${matchingProduct.image}" alt="${matchingProduct.name}">

          <div class="cart-item-details">
            <div class="product-name">
              ${matchingProduct.name}
            </div>
            <div class="product-price">
              $${formatCurrency(matchingProduct.priceCents)}
            </div>
            <div class="product-quantity">
              <span>Quantity:</span>
              <select class="js-checkout-quantity-select" data-product-id="${matchingProduct.id}" aria-label="Quantity select">
                ${quantityOptionsHTML(cartItem.quantity)}
              </select>
              <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}">
                Delete
              </span>
            </div>
          </div>

          <div class="delivery-options">
            <div class="delivery-options-title">
              Choose a delivery option:
            </div>
            ${deliveryOptionsHTML(matchingProduct, cartItem)}
          </div>
        </div>
      </div>`;
  });

  function deliveryOptionsHTML(matchingProduct, cartItem) {
    let html = '';
    deliveryOptions.forEach((option) => {
      const today = dayjs();
      const deliveryDate = today.add(option.deliveryDays, 'day');
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = option.priceCents === 0 ? 'Free' : `$${formatCurrency(option.priceCents)}`;
      const isChecked = option.id === cartItem.deliveryOptionId;

      html += `
        <div class="delivery-option js-delivery-option" 
          data-product-id="${matchingProduct.id}" 
          data-delivery-option-id="${option.id}">
          <input type="radio"
            ${isChecked ? 'checked' : ''}
            class="delivery-option-input"
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} - Shipping
            </div>
          </div>
        </div>`;
    });
    return html;
  }

  const orderSummaryEl = document.querySelector('.js-order-summary');
  if (orderSummaryEl) {
    orderSummaryEl.innerHTML = cartSummaryHTML;

    orderSummaryEl.querySelectorAll('.product-image').forEach((image) => {
      image.addEventListener('error', handleImageError);
    });
  }

  // Bind Delete Links
  document.querySelectorAll('.js-delete-link').forEach((link) => {
    link.addEventListener('click', () => {
      const productId = link.dataset.productId;
      removeFromCart(productId);

      const deleteProduct = document.querySelector(`.js-cart-item-container-${productId}`);
      if (deleteProduct) {
        deleteProduct.remove();
      }
      updateCartBadge();
      renderPaymentSummary();
    });
  });

  // Bind Quantity Selector Changes
  document.querySelectorAll('.js-checkout-quantity-select').forEach((select) => {
    select.addEventListener('change', () => {
      const productId = select.dataset.productId;
      const newQuantity = Number(select.value);

      const cartItem = cart.find(item => item.productId === productId);
      if (cartItem) {
        cartItem.quantity = newQuantity;
        localStorage.setItem('cart', JSON.stringify(cart));
      }
      updateCartBadge();
      renderPaymentSummary();
    });
  });

  // Bind Delivery Option Selections
  document.querySelectorAll('.js-delivery-option').forEach((element) => {
    element.addEventListener('click', () => {
      const { productId, deliveryOptionId } = element.dataset;
      if (!productId || !deliveryOptionId) return;
      updateDeliveryOption(productId, deliveryOptionId);
      renderOrderSummary();
      renderPaymentSummary();
    });
  });
}