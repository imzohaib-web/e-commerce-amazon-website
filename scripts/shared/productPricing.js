export function getDiscountDetails(priceCents) {
  const discountPercent = (priceCents % 3) * 10 + 10;
  const originalPriceCents = Math.round(priceCents / (1 - discountPercent / 100));

  return { discountPercent, originalPriceCents };
}
