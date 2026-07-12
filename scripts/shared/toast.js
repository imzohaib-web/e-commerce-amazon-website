import { TOAST_DURATION_MS } from './constants.js';

export function showToast(message, imageUrl, containerSelector = '.js-toast-container') {
  const toastContainer = document.querySelector(containerSelector);
  if (!toastContainer) {
    return;
  }

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
  }, TOAST_DURATION_MS);
}
