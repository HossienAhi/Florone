const { SIZE_CODES } = require("./customPizzaConstants");

/** Round to nearest 10,000 Toman (for tests / future use — not applied to live totals yet). */
function roundNearest10k(amount) {
  const n = Number(amount) || 0;
  return Math.round(n / 10000) * 10000;
}

function multiplierBpsToFloat(bps) {
  return (Number(bps) || 100) / 100;
}

function calculateToppingPrice(unitPrice, multiplierBps) {
  const mult = multiplierBpsToFloat(multiplierBps);
  return Math.round((Number(unitPrice) || 0) * mult);
}

function getSizeBasePrice(sizeCode, settings) {
  if (sizeCode === "family") return settings.basePriceFamily;
  return settings.basePriceMedium;
}

function getToppingMultiplierBps(sizeCode, settings) {
  if (sizeCode === "family") {
    return Math.round((settings.familyToppingMultiplier || 1.3) * 100);
  }
  return 100;
}

function calculateCustomPizzaTotal(sizeCode, toppingRows, settings, quantity = 1) {
  const base = getSizeBasePrice(sizeCode, settings);
  const bps = getToppingMultiplierBps(sizeCode, settings);
  const toppingsTotal = (toppingRows || []).reduce(
    (sum, t) => sum + calculateToppingPrice(t.priceMedium, bps),
    0
  );
  const itemTotal = base + toppingsTotal;
  return itemTotal * Math.max(1, Number(quantity) || 1);
}

function buildPriceBreakdown(sizeCode, toppingRows, settings, quantity = 1) {
  const base = getSizeBasePrice(sizeCode, settings);
  const bps = getToppingMultiplierBps(sizeCode, settings);
  const toppings = (toppingRows || []).map((t) => ({
    code: t.id,
    label: t.name,
    category: t.groupKey,
    unitPrice: t.priceMedium,
    calculatedPrice: calculateToppingPrice(t.priceMedium, bps),
  }));
  const toppingsTotal = toppings.reduce((s, t) => s + t.calculatedPrice, 0);
  const itemTotal = base + toppingsTotal;
  const qty = Math.max(1, Number(quantity) || 1);
  return {
    sizeCode,
    basePrice: base,
    toppingMultiplierBps: bps,
    toppings,
    toppingsTotal,
    itemTotal,
    quantity: qty,
    lineTotal: itemTotal * qty,
  };
}

module.exports = {
  roundNearest10k,
  calculateToppingPrice,
  calculateCustomPizzaTotal,
  buildPriceBreakdown,
  getSizeBasePrice,
  getToppingMultiplierBps,
  multiplierBpsToFloat,
  SIZE_CODES,
};
