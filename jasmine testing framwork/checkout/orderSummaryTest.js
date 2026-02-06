import { loadFromStorage, cart } from "../../data/cart.js";
import { renderOrderSummary } from "../../scripts/checkout/orderSummary.js";
import { getProduct } from "../../data/products.js";

describe('test suite: renderOrderSummary', () => {
    beforeEach(() => {
        // Setup test container
        document.querySelector('.js-test-container').innerHTML = `<div class="js-order-summary"></div>`;

        // Clear the cart array (module already imported, so we populate it manually)
        cart.length = 0;
        
        // Manually add test data to cart
        cart.push(
            {
                productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
                quantity: 2,
                deliveryOptionId: '1'
            },
            {
                productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
                quantity: 1,
                deliveryOptionId: '2'
            }
        );

        // Mock localStorage
        spyOn(localStorage, 'getItem').and.callFake(() => {
            return JSON.stringify(cart);
        });
        spyOn(localStorage, 'setItem');
    });

    it('displays the cart correctly', () => {
        renderOrderSummary();

        const cartItems = document.querySelectorAll('.cart-item-container');
        expect(cartItems.length).toEqual(2);
    });

    it('renders product quantity correctly', () => {
        renderOrderSummary();

        const quantityLabels = document.querySelectorAll('.quantity-label');
        
        // First product should have quantity 2
        expect(quantityLabels[0].innerText).toEqual('2');
        // Second product should have quantity 1
        expect(quantityLabels[1].innerText).toEqual('1');
    });

    it('renders correct product names', () => {
        renderOrderSummary();

        const productNames = document.querySelectorAll('.product-name');
        const product1 = getProduct('e43638ce-6aa0-4b85-b27f-e1d07eb678c6');
        const product2 = getProduct('15b6fc6f-327a-4ec4-896f-486349e85a3d');

        expect(productNames[0].innerText).toEqual(product1.name);
        expect(productNames[1].innerText).toEqual(product2.name);
    });

    it('renders delivery options for each product', () => {
        renderOrderSummary();

        const deliveryOptions = document.querySelectorAll('.delivery-option');
        // 2 products × 3 delivery options each = 6 total options
        expect(deliveryOptions.length).toEqual(6);
    });

    it('marks the correct delivery option as checked', () => {
        renderOrderSummary();

        const checkedInputs = document.querySelectorAll('.delivery-option-input:checked');
        expect(checkedInputs.length).toEqual(2); // one for each product
    });
});