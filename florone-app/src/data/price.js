const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

export function toFa(value) {
  return String(value).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

export function parsePrice(value) {
  if (typeof value === 'number') return value;
  const normalized = String(value ?? '')
    .replace(/[۰-۹]/g, (d) => '۰۱۲۳۴۵۶۷۸۹'.indexOf(d))
    .replace(/[٠-٩]/g, (d) => '٠١٢٣٤٥٦٧٨٩'.indexOf(d))
    .replace(/[^\d.]/g, '');
  return Number(normalized || 0);
}

export function formatToman(n) {
  const grouped = Math.round(Number(n) || 0)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return toFa(grouped);
}

/* discount-aware pricing for a menu item.
   `discount` is a percentage (0-100). Returns numeric + formatted values. */
export function getItemPricing(item) {
  const original = parsePrice(item?.price);
  const discount = Number(item?.discount) || 0;
  const hasDiscount = discount > 0 && discount < 100 && original > 0;
  const finalRaw = hasDiscount ? (original * (100 - discount)) / 100 : original;
  // round to the nearest 1,000 toman for tidy prices
  const final = hasDiscount ? Math.round(finalRaw / 1000) * 1000 : original;
  return {
    original,
    final,
    discount,
    hasDiscount,
    originalLabel: formatToman(original),
    finalLabel: formatToman(final),
  };
}
