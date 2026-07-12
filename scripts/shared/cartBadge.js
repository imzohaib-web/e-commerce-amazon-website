import { cart } from '../../data/cart.js';

const cartQuantityEl = document.querySelector('.js-cart-quantity');

export function updateCartBadge() {
  if (!cartQuantityEl) {
    return;
  }

  const cartQuantity = cart.reduce((total, cartItem) => total + cartItem.quantity, 0);
  cartQuantityEl.textContent = cartQuantity;
}
