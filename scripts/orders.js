import { orders, deleteOrder } from '../data/orders.js';
import { getProduct } from '../data/products.js';
import { addToCart } from '../data/cart.js';
import { updateCartBadge } from './shared/cartBadge.js';
import { showToast } from './shared/toast.js';
import { initSearchRedirect } from './shared/searchRedirect.js';
import { initBackToTopFooter } from './shared/scrollToTop.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';
import { formatCurrency } from './utils/money.js';

let orderIdToDelete = null;

initBackToTopFooter();
initSearchRedirect();
initDeleteModal();
renderOrdersList();
updateCartBadge();

function renderOrdersList() {
  const ordersGrid = document.querySelector('.js-orders-grid');
  if (!ordersGrid) return;

  if (orders.length === 0) {
    ordersGrid.innerHTML = `
      <div class="empty-orders-container">
        <div class="empty-orders-icon">📦</div>
        <div class="empty-orders-message">You haven't placed any orders yet.</div>
        <a href="amazon.html" class="btn-action btn-primary continue-shopping-btn">Continue Shopping</a>
      </div>
    `;
    return;
  }

  let ordersHTML = '';

  orders.forEach((order) => {
    const formattedOrderDate = dayjs(order.orderTime).format('MMMM D, YYYY');
    const formattedTotal = formatCurrency(order.totalCents);
    
    let itemsHTML = '';

    order.items.forEach((item) => {
      const product = getProduct(item.productId);
      if (!product) return;

      const orderTime = dayjs(order.orderTime);
      const deliveryDate = dayjs(item.estimatedDeliveryDate);
      const today = dayjs();

      // Estimate status dynamically based on current time
      const totalDuration = deliveryDate.diff(orderTime, 'hours');
      const elapsed = today.diff(orderTime, 'hours');
      
      let progressPercent = 0;
      if (totalDuration > 0) {
        progressPercent = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));
      } else {
        progressPercent = 100;
      }

      let statusText = 'Processing';
      let statusClass = 'status-processing';
      let deliveryText = `Estimated delivery on ${dayjs(item.estimatedDeliveryDate).format('MMMM D, YYYY')}`;

      if (progressPercent >= 100) {
        statusText = 'Delivered';
        statusClass = 'status-delivered';
        deliveryText = `Arrived on ${dayjs(item.estimatedDeliveryDate).format('MMMM D, YYYY')}`;
      } else if (progressPercent >= 25) {
        statusText = 'Shipped';
        statusClass = 'status-shipped';
      }

      itemsHTML += `
        <div class="order-item-row">
          <img class="product-image" src="${product.image}" alt="${product.name}">
          <div class="product-info-details">
            <h4 class="product-name">${product.name}</h4>
            <div class="delivery-status-row">
              <span class="status-badge ${statusClass}">${statusText}</span>
              <span class="delivery-date-text">${deliveryText}</span>
            </div>
            <div class="item-specs">
              <span>Price: <strong>$${formatCurrency(product.priceCents)}</strong></span>
              <span>Quantity: <strong>${item.quantity}</strong></span>
            </div>
            <div class="button-group">
              <button class="btn-action btn-primary js-buy-again" data-product-id="${product.id}">
                Buy it again
              </button>
              <button class="btn-action btn-secondary js-view-details" data-product-id="${product.id}">
                View Details
              </button>
            </div>
          </div>
          <div class="order-item-sidebar">
            <a href="tracking.html?orderId=${order.id}&productId=${product.id}" class="sidebar-btn sidebar-btn-track">Track Package</a>
            <button class="sidebar-btn sidebar-btn-action" onclick="alert('Return request initiated.')">Return Item</button>
          </div>
        </div>
      `;
    });

    ordersHTML += `
      <div class="order-card-container">
        <div class="order-card-header">
          <div class="order-header-left">
            <div class="header-info-box">
              <span class="info-label">Order Placed</span>
              <span class="info-value">${formattedOrderDate}</span>
            </div>
            <div class="header-info-box">
              <span class="info-label">Total Price</span>
              <span class="info-value">$${formattedTotal}</span>
            </div>
            <div class="header-info-box">
              <span class="info-label">Ship To</span>
              <span class="info-value link-primary">${order.shipTo || 'Jane Doe'}</span>
            </div>
          </div>
          <div class="order-header-right">
            <div style="margin-bottom: 8px;">
              <span class="info-label">Order ID:</span>
              <span class="info-value" style="word-break: break-all;">${order.id}</span>
            </div>
            <button class="delete-order-button js-delete-order-button" data-order-id="${order.id}">
              Delete Order
            </button>
          </div>
        </div>
        <div class="order-items-list">
          ${itemsHTML}
        </div>
      </div>
    `;
  });

  ordersGrid.innerHTML = ordersHTML;

  // Bind all interactive elements
  bindEvents();
}

function showProductDetails(productId) {
  const product = getProduct(productId);
  if (!product) return;
  
  const modalHTML = `
    <div class="product-details-modal-backdrop js-details-modal-backdrop">
      <div class="product-details-modal">
        <div class="modal-header">
          <h3>Product Specifications</h3>
          <button class="close-details-btn js-close-details">&times;</button>
        </div>
        <div class="modal-body product-details-body">
          <div class="product-details-main">
            <img class="details-product-image" src="${product.image}" alt="${product.name}">
            <div class="details-product-info">
              <h4 class="details-product-name">${product.name}</h4>
              <p class="details-product-price">Price: <strong>$${formatCurrency(product.priceCents)}</strong></p>
              <p class="details-product-rating">Rating: <strong>${product.rating.stars} ⭐</strong> (${product.rating.count} reviews)</p>
              <p class="details-product-stock">Status: <span class="stock-status-badge">${product.stockStatus || 'In Stock'}</span></p>
            </div>
          </div>
          <div class="product-details-desc">
            <h5>Description</h5>
            <p>${product.description || 'No description available for this product.'}</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-action btn-primary js-details-buy-again" data-product-id="${product.id}">Buy Again</button>
          <button class="btn-action btn-secondary js-close-details-btn">Close</button>
        </div>
      </div>
    </div>
  `;
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = modalHTML;
  const modalEl = tempDiv.firstElementChild;
  document.body.appendChild(modalEl);
  
  setTimeout(() => {
    modalEl.classList.add('show');
  }, 10);
  
  const closeModal = () => {
    modalEl.classList.remove('show');
    setTimeout(() => {
      modalEl.remove();
    }, 300);
  };
  
  modalEl.querySelector('.js-close-details').addEventListener('click', closeModal);
  modalEl.querySelector('.js-close-details-btn').addEventListener('click', closeModal);
  modalEl.querySelector('.js-details-buy-again').addEventListener('click', () => {
    addToCart(product.id, 1);
    updateCartBadge();
    showToast(product.name, product.image);
    closeModal();
  });
}

function bindEvents() {
  // Buy again buttons
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

  // View Details buttons
  document.querySelectorAll('.js-view-details').forEach((button) => {
    button.addEventListener('click', () => {
      const productId = button.dataset.productId;
      showProductDetails(productId);
    });
  });

  // Delete Order buttons (opens modal)
  document.querySelectorAll('.js-delete-order-button').forEach((button) => {
    button.addEventListener('click', () => {
      orderIdToDelete = button.dataset.orderId;
      const modalBackdrop = document.querySelector('.js-modal-backdrop');
      if (modalBackdrop) {
        modalBackdrop.classList.add('show');
      }
    });
  });
}

function initDeleteModal() {
  const modalBackdrop = document.querySelector('.js-modal-backdrop');
  if (!modalBackdrop) return;

  const closeModal = () => {
    modalBackdrop.classList.remove('show');
    orderIdToDelete = null;
  };

  modalBackdrop.querySelector('.js-close-modal').addEventListener('click', closeModal);
  modalBackdrop.querySelector('.js-cancel-delete').addEventListener('click', closeModal);

  modalBackdrop.querySelector('.js-confirm-delete').addEventListener('click', () => {
    if (orderIdToDelete) {
      deleteOrder(orderIdToDelete);
      closeModal();
      renderOrdersList();
    }
  });

  // Close when clicking outside the modal box
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  });
}
