// Tests for addToCart
describe('test suite: addToCart', () => {
    let addToCart, cartModule;

    beforeEach(async () => {
        spyOn(localStorage, 'getItem').and.callFake(() => JSON.stringify([]));
        spyOn(localStorage, 'setItem').and.callFake(() => {});

        // import after spying so module initialization uses the mocked localStorage
        const module = await import("../../data/cart.js");
        addToCart = module.addToCart;
        cartModule = module;
        // ensure a clean cart array for each test (mutate existing array to avoid reassigning export)
        if (Array.isArray(cartModule.cart)) cartModule.cart.length = 0;
    });

    it('adds a product when cart is empty', () => {
        addToCart('e43638ce-6aa0-4b85-b27f-e1d07eb678c6');

        expect(cartModule.cart.length).toEqual(1);
        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(cartModule.cart[0].productId).toEqual('e43638ce-6aa0-4b85-b27f-e1d07eb678c6');
        expect(cartModule.cart[0].quantity).toEqual(1);
    });

    it('increments quantity when product already exists', () => {
        // start with a cart that already contains the product
        cartModule.cart.push({
            productId: 'e43638ce-6aa0-4b85-b27f-e1d07eb678c6',
            quantity: 2,
            deliveryOptionId: '1'
        });

        localStorage.setItem.calls.reset();

        addToCart('e43638ce-6aa0-4b85-b27f-e1d07eb678c6');

        expect(cartModule.cart.length).toEqual(1);
        expect(cartModule.cart[0].quantity).toEqual(3);
        expect(localStorage.setItem).toHaveBeenCalled();
    });
});