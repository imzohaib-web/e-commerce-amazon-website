import { cart } from '../../data/cart.js';
import { getProduct } from '../../data/products.js';
import { getDeliveryOption } from '../../data/deliveryOptions.js';
import { formatCurrency } from '../utils/money.js';
import { addOrder } from '../../data/orders.js';
import dayjs from 'https://unpkg.com/supersimpledev@8.5.0/dayjs/esm/index.js';

export function renderPaymentSummary() {
  let productPriceCents = 0;
  let shippingPriceCents = 0;
  let cartQuantity = 0;

  cart.forEach((cartItem) => {
    const product = getProduct(cartItem.productId);
    if (!product) return;
    
    productPriceCents += product.priceCents * cartItem.quantity;
    cartQuantity += cartItem.quantity;

    const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
    if (deliveryOption) {
      shippingPriceCents += deliveryOption.priceCents;
    }
  });

  const totalBeforeTaxCents = productPriceCents + shippingPriceCents;
  const taxCents = Math.round(totalBeforeTaxCents * 0.1);
  const totalCents = totalBeforeTaxCents + taxCents;

  const paymentSummaryHTML = `
    <div class="payment-summary-title">
      Order Summary
    </div>

    <div class="payment-summary-row">
      <div>Items (${cartQuantity}):</div>
      <div class="payment-summary-money">$${formatCurrency(productPriceCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Shipping &amp; handling:</div>
      <div class="payment-summary-money">$${formatCurrency(shippingPriceCents)}</div>
    </div>

    <div class="payment-summary-row subtotal-row">
      <div>Total before tax:</div>
      <div class="payment-summary-money">$${formatCurrency(totalBeforeTaxCents)}</div>
    </div>

    <div class="payment-summary-row">
      <div>Estimated tax (10%):</div>
      <div class="payment-summary-money">$${formatCurrency(taxCents)}</div>
    </div>

    <div class="payment-summary-row total-row">
      <div>Order total:</div>
      <div class="payment-summary-money">$${formatCurrency(totalCents)}</div>
    </div>

    <button class="place-order-button js-place-order-button">
      Place your order
    </button>`;

  const summaryEl = document.querySelector('.js-payment-summary');
  if (summaryEl) {
    summaryEl.innerHTML = paymentSummaryHTML;
  }

  // Bind Place Order button click
  const placeOrderBtn = document.querySelector('.js-place-order-button');
  if (placeOrderBtn) {
    placeOrderBtn.addEventListener('click', () => {
      if (cart.length === 0) {
        alert('Your cart is empty! Please add some items to your cart first.');
        return;
      }

      // Read Full Name from input form
      const nameInput = document.querySelector('.shipping-info-form input[placeholder="Full Name"]');
      const shipToName = nameInput ? nameInput.value.trim() : 'Jane Doe';

      // Generate a unique order ID
      const orderId = typeof crypto !== 'undefined' && crypto.randomUUID 
        ? crypto.randomUUID() 
        : Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      // Construct order items
      const orderItems = cart.map((cartItem) => {
        const deliveryOption = getDeliveryOption(cartItem.deliveryOptionId);
        const today = dayjs();
        const deliveryDate = today.add(deliveryOption.deliveryDays, 'days');

        return {
          productId: cartItem.productId,
          quantity: cartItem.quantity,
          deliveryOptionId: cartItem.deliveryOptionId,
          estimatedDeliveryDate: deliveryDate.toISOString()
        };
      });

      // Construct the order object
      const newOrder = {
        id: orderId,
        orderTime: dayjs().toISOString(),
        totalCents: totalCents,
        shipTo: shipToName,
        items: orderItems
      };

      // Add to storage
      addOrder(newOrder);
      
      // Clear cart storage and in-memory array
      localStorage.setItem('cart', JSON.stringify([]));
      cart.length = 0; 
      
      alert('Thank you for your order! Your purchase was successful and your order has been placed.');
      window.location.href = 'orders.html';
    });
  }
}