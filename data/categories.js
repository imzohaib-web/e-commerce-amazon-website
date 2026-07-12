const CATEGORY_KEYWORDS = {
  clothing: [
    'apparel', 'socks', 'tshirts', 'sweaters', 'hoodies', 'shorts',
    'shoes', 'footwear', 'sandals', 'hats', 'swimwear',
  ],
  kitchen: [
    'appliances', 'toaster', 'coffeemaker', 'blender', 'kettle', 'kitchen',
    'dining', 'plates', 'cookware', 'knives', 'mugs',
  ],
  sports: ['sports', 'basketballs', 'fitness', 'golf', 'polo', 'gym'],
  home: [
    'bedroom', 'bathroom', 'home', 'curtains', 'towels', 'bathmat', 'rug',
    'laundry', 'cleaning', 'tissue', 'napkins',
  ],
  accessories: [
    'accessories', 'shades', 'jewelry', 'earrings', 'sunglasses', 'watch',
    'backpack', 'umbrella',
  ],
  electronics: [
    'electronics', 'headphones', 'chargers', 'speakers', 'mouse', 'gaming',
  ],
};

function hasKeyword(product, keywords) {
  return product.keywords?.some((keyword) =>
    keywords.includes(keyword.toLowerCase())
  );
}

export function getProductCategory(product) {
  if (product.type === 'clothing' || hasKeyword(product, CATEGORY_KEYWORDS.clothing)) {
    return 'clothing';
  }
  if (hasKeyword(product, CATEGORY_KEYWORDS.kitchen)) {
    return 'kitchen';
  }
  if (hasKeyword(product, CATEGORY_KEYWORDS.sports)) {
    return 'sports';
  }
  if (hasKeyword(product, CATEGORY_KEYWORDS.home)) {
    return 'home';
  }
  if (hasKeyword(product, CATEGORY_KEYWORDS.accessories)) {
    return 'accessories';
  }
  if (hasKeyword(product, CATEGORY_KEYWORDS.electronics)) {
    return 'electronics';
  }
  return 'other';
}
