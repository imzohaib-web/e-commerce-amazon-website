import { products } from '../../data/products.js';
import { getProductCategory } from '../../data/categories.js';
import { filterState } from './filterState.js';

function matchesPriceRange(priceCents, priceRange) {
  const dollars = priceCents / 100;

  if (priceRange === 'under-20') {
    return dollars < 20;
  }
  if (priceRange === '20-50') {
    return dollars >= 20 && dollars <= 50;
  }
  if (priceRange === '50-100') {
    return dollars >= 50 && dollars <= 100;
  }
  if (priceRange === 'above-100') {
    return dollars > 100;
  }

  return true;
}

function sortProducts(filteredProducts, sortBy) {
  const sortedProducts = [...filteredProducts];

  if (sortBy === 'price-asc') {
    sortedProducts.sort((a, b) => a.priceCents - b.priceCents);
  } else if (sortBy === 'price-desc') {
    sortedProducts.sort((a, b) => b.priceCents - a.priceCents);
  } else if (sortBy === 'rating-desc') {
    sortedProducts.sort(
      (a, b) => b.rating.stars - a.rating.stars || b.rating.count - a.rating.count
    );
  } else if (sortBy === 'best-selling') {
    sortedProducts.sort((a, b) => b.rating.count - a.rating.count);
  } else if (sortBy === 'name-asc') {
    sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  return sortedProducts;
}

export function filterAndSortProducts() {
  const { searchQuery, selectedCategory, priceRange, sortBy } = filterState;
  let filtered = [...products];

  const cleanQuery = searchQuery.trim().toLowerCase();
  if (cleanQuery) {
    filtered = filtered.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(cleanQuery);
      const keywordMatch = product.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(cleanQuery)
      );
      const typeMatch = product.type?.toLowerCase().includes(cleanQuery);

      return nameMatch || keywordMatch || typeMatch;
    });
  }

  if (selectedCategory !== 'all') {
    filtered = filtered.filter(
      (product) => getProductCategory(product) === selectedCategory
    );
  }

  if (priceRange !== 'all') {
    filtered = filtered.filter((product) =>
      matchesPriceRange(product.priceCents, priceRange)
    );
  }

  return sortProducts(filtered, sortBy);
}
