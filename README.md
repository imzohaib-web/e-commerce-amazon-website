# JavaScript Amazon Project

## Overview

This project is a static e-commerce demo inspired by Amazon. It includes product browsing, shopping cart behavior, checkout flow, order tracking, and a simple product listing UI. The project is built with HTML, CSS, and JavaScript, and it includes client-side data files and Jasmine tests.

## Features

- Product gallery and filtering
- Cart badge and cart management
- Checkout flow with order summary and payment details
- Order tracking page
- Modular JavaScript organization with shared helper utilities
- Jasmine test suite for core components

## Project Structure

- `amazon.html` - Main shopping page
- `checkout.html` - Checkout page
- `orders.html` - Orders page
- `tracking.html` - Order tracking page
- `backend/products.json` - Product data source
- `data/` - Static data modules used by scripts
- `images/` - Product images, icons, and ratings assets
- `scripts/` - JavaScript application code
  - `shared/` - Shared utilities and common behavior
  - `amazon/` - Shopping page components
  - `checkout/` - Checkout-specific components
- `styles/` - CSS files for pages and shared layout
- `jasmine testing framwork/` - Jasmine test runner and support files
- `tests/` - Additional test scripts and runner pages

## Usage

### Run Locally

1. Open the project folder in your browser or use a local static server.
2. Open `amazon.html` to start browsing products.
3. Use the navigation or open `checkout.html`, `orders.html`, or `tracking.html` directly to view other flows.

### Recommended Local Server

For best results and to avoid browser restrictions on local file access, serve the project from a local static server.

Example using Python 3:

```powershell
cd "d:\Web Development\web project\web\javascript-amazon-project-main"
python -m http.server 8000
```

Then visit:

- `http://localhost:8000/amazon.html`
- `http://localhost:8000/checkout.html`
- `http://localhost:8000/orders.html`
- `http://localhost:8000/tracking.html`

## Testing

The project includes Jasmine tests in the `jasmine testing framwork/` folder.

To run tests:

1. Open `jasmine testing framwork/tests.html` in your browser.
2. Review the results in the Jasmine test runner UI.

## Notes

- This is a front-end demo project and does not include a production back-end server.
- Data is loaded from static JSON and JavaScript modules.

## License

This project does not include a specific license file. If you intend to use or share it, consider adding a `LICENSE` file with your preferred license.
