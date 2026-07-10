/** Default custom-pizza config — keep in sync with florone-app/src/data/customPizzaData.js */

const PIZZA_BUILDER_CONFIG = {
  minToppings: 3,
  maxToppings: 7,
  basePrices: { medium: 550_000, family: 780_000 },
  familyToppingMultiplier: 1.3,
};

const PIZZA_TOPPINGS = [
  { id: "alfredo", name: "آلفردو", emoji: "🥛", price: 0, group: "sauce", available: true },
  { id: "marinara", name: "مارینارا", emoji: "🍅", price: 0, group: "sauce", available: true },
  { id: "pesto", name: "پستو", emoji: "🌿", price: 0, group: "sauce", available: true },
  { id: "garlic", name: "سیر", emoji: "🧄", price: 0, group: "sauce", available: true },
  { id: "gouda", name: "پنیر گودا", emoji: "🧀", price: 0, group: "cheese", available: true },
  { id: "marta", name: "پنیر مارتا", emoji: "🧀", price: 0, group: "cheese", available: true },
  { id: "ground-beef", name: "گوشت چرخ کرده", emoji: "🥩", price: 50_000, group: "meat", available: true },
  { id: "roast-beef", name: "رست بیف", emoji: "🍖", price: 60_000, group: "meat", available: true },
  { id: "steak", name: "گوشت استیک", emoji: "🥩", price: 70_000, group: "meat", available: true },
  { id: "pepperoni", name: "پپرونی", emoji: "🍕", price: 55_000, group: "classic", available: true },
  { id: "bacon", name: "بیکن", emoji: "🥓", price: 50_000, group: "classic", available: true },
  { id: "curry-chicken", name: "مرغ کاری", emoji: "🍛", price: 45_000, group: "chicken", available: true },
  { id: "plain-chicken", name: "مرغ ساده", emoji: "🍗", price: 40_000, group: "chicken", available: true },
  { id: "bell-pepper", name: "فلفل دلمه", emoji: "🫑", price: 20_000, group: "vegetable", available: true },
  { id: "olive", name: "زیتون", emoji: "🫒", price: 30_000, group: "vegetable", available: true },
  { id: "mushroom", name: "قارچ", emoji: "🍄", price: 35_000, group: "vegetable", available: true },
  { id: "onion", name: "پیاز", emoji: "🧅", price: 18_000, group: "vegetable", available: true },
  { id: "jalapeno", name: "هالوپینو", emoji: "🌶️", price: 24_000, group: "vegetable", available: true },
];

function getDefaultCustomPizzaSettings() {
  return {
    basePriceMedium: PIZZA_BUILDER_CONFIG.basePrices.medium,
    basePriceFamily: PIZZA_BUILDER_CONFIG.basePrices.family,
    familyToppingMultiplier: PIZZA_BUILDER_CONFIG.familyToppingMultiplier,
    minToppings: PIZZA_BUILDER_CONFIG.minToppings,
    maxToppings: PIZZA_BUILDER_CONFIG.maxToppings,
  };
}

function getDefaultCustomPizzaToppings() {
  return PIZZA_TOPPINGS.map((t, i) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    groupKey: t.group,
    priceMedium: t.price,
    available: t.available,
    sortOrder: i,
  }));
}

function normalizeGroupKey(groupKey) {
  if (groupKey === "pepperoni" || groupKey === "bacon") return "classic";
  return groupKey;
}

function serializeCustomPizzaConfig(settings, toppings) {
  return {
    settings: {
      basePriceMedium: settings.basePriceMedium,
      basePriceFamily: settings.basePriceFamily,
      familyToppingMultiplier: settings.familyToppingMultiplier,
      minToppings: settings.minToppings,
      maxToppings: settings.maxToppings,
    },
    toppings: toppings
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => ({
        id: t.id,
        name: t.name,
        emoji: t.emoji,
        group: normalizeGroupKey(t.groupKey),
        priceMedium: t.priceMedium,
        priceFamily: Math.round(t.priceMedium * settings.familyToppingMultiplier),
        available: t.available,
        isActive: t.isActive !== false,
        sortOrder: t.sortOrder,
      })),
  };
}

async function ensureCustomPizzaConfig(prisma) {
  const defaults = getDefaultCustomPizzaSettings();
  const settings = await prisma.customPizzaSettings.upsert({
    where: { id: "default" },
    create: { id: "default", ...defaults },
    update: { maxToppings: defaults.maxToppings, minToppings: defaults.minToppings },
  });

  const seedToppings = getDefaultCustomPizzaToppings();
  for (const t of seedToppings) {
    await prisma.customPizzaTopping.upsert({
      where: { id: t.id },
      create: t,
      update: {
        name: t.name,
        emoji: t.emoji,
        groupKey: t.groupKey,
        sortOrder: t.sortOrder,
        isActive: true,
      },
    });
  }

  const toppings = await prisma.customPizzaTopping.findMany({ orderBy: { sortOrder: "asc" } });
  return serializeCustomPizzaConfig(settings, toppings);
}

module.exports = {
  ensureCustomPizzaConfig,
  serializeCustomPizzaConfig,
  getDefaultCustomPizzaSettings,
  PIZZA_BUILDER_CONFIG,
};
