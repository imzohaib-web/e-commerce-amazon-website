import { updateCartBadge } from './shared/cartBadge.js';
import { initSearchRedirect } from './shared/searchRedirect.js';
import { initBackToTopFooter } from './shared/scrollToTop.js';
import { getOrder } from '../data/orders.js';
import { getProduct } from '../data/products.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

initBackToTopFooter();
initSearchRedirect();
updateCartBadge();
renderTrackingDetails();

function renderTrackingDetails() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get('orderId');
  const productId = urlParams.get('productId');

  if (!orderId || !productId) {
    window.location.href = 'orders.html';
    return;
  }

  const order = getOrder(orderId);
  if (!order) {
    window.location.href = 'orders.html';
    return;
  }

  const orderItem = order.items.find((item) => item.productId === productId);
  const product = getProduct(productId);

  if (!orderItem || !product) {
    window.location.href = 'orders.html';
    return;
  }

  // Calculate dynamic status and progress
  const orderTime = dayjs(order.orderTime);
  const deliveryDate = dayjs(orderItem.estimatedDeliveryDate);
  const today = dayjs();

  const totalDuration = deliveryDate.diff(orderTime, 'hours');
  const elapsed = today.diff(orderTime, 'hours');

  let progressPercent = 0;
  if (totalDuration > 0) {
    progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
  } else {
    progressPercent = 100;
  }

  // Render delivery date
  const deliveryDateEl = document.querySelector('.js-delivery-date');
  if (deliveryDateEl) {
    const formattedDate = deliveryDate.format('dddd, MMMM D');
    if (progressPercent >= 100) {
      deliveryDateEl.textContent = `Arrived on ${formattedDate}`;
    } else {
      deliveryDateEl.textContent = `Arriving on ${formattedDate}`;
    }
  }

  // Render product name
  const nameEl = document.querySelector('.js-product-info-name');
  if (nameEl) {
    nameEl.textContent = product.name;
  }

  // Render quantity
  const qtyEl = document.querySelector('.js-product-info-qty');
  if (qtyEl) {
    qtyEl.textContent = `Quantity: ${orderItem.quantity}`;
  }

  // Render product image
  const imageBoxEl = document.querySelector('.js-product-image-box');
  if (imageBoxEl) {
    imageBoxEl.innerHTML = `<img class="product-image" src="${product.image}" alt="${product.name}">`;
  }

  // Render progress labels
  const preparingLabel = document.querySelector('.js-progress-label-preparing');
  const shippedLabel = document.querySelector('.js-progress-label-shipped');
  const deliveredLabel = document.querySelector('.js-progress-label-delivered');

  // Reset classes
  if (preparingLabel) preparingLabel.className = 'progress-label js-progress-label-preparing';
  if (shippedLabel) shippedLabel.className = 'progress-label js-progress-label-shipped';
  if (deliveredLabel) deliveredLabel.className = 'progress-label js-progress-label-delivered';

  if (progressPercent < 25) {
    if (preparingLabel) preparingLabel.classList.add('current-status');
  } else if (progressPercent < 100) {
    if (preparingLabel) preparingLabel.classList.add('completed');
    if (shippedLabel) shippedLabel.classList.add('current-status');
  } else {
    if (preparingLabel) preparingLabel.classList.add('completed');
    if (shippedLabel) shippedLabel.classList.add('completed');
    if (deliveredLabel) deliveredLabel.classList.add('current-status');
  }

  // Render progress bar width
  const progressBarEl = document.querySelector('.js-progress-bar');
  if (progressBarEl) {
    progressBarEl.style.width = `${progressPercent}%`;
  }
}
