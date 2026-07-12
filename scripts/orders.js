import { addToCart } from '../data/cart.js';
import { getProduct } from '../data/products.js';
import { updateCartBadge } from './shared/cartBadge.js';
import { showToast } from './shared/toast.js';
import { initSearchRedirect } from './shared/searchRedirect.js';
import { initBackToTopFooter } from './shared/scrollToTop.js';

initBackToTopFooter();
initSearchRedirect();

document.querySelectorAll('.js-buy-again').forEach((button) => {
  button.addEventListener('click', () => {
    const productId = button.dataset.productId;
    addToCart(productId, 1);
    updateCartBadge();

    const product = getProduct(productId);
    if (product) {
      showToast(product.name, product.image);
    }
  });
});

updateCartBadge();
