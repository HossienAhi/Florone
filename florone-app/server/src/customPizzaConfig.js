import {
  PIZZA_BUILDER_CONFIG,
  PIZZA_TOPPINGS,
} from '../../src/data/customPizzaData.js';

export function getDefaultCustomPizzaSettings() {
  return {
    basePriceMedium: PIZZA_BUILDER_CONFIG.basePrices.medium,
    basePriceFamily: PIZZA_BUILDER_CONFIG.basePrices.family,
    familyToppingMultiplier: PIZZA_BUILDER_CONFIG.familyToppingMultiplier,
    minToppings: PIZZA_BUILDER_CONFIG.minToppings,
    maxToppings: PIZZA_BUILDER_CONFIG.maxToppings,
  };
}

export function getDefaultCustomPizzaToppings() {
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
  if (groupKey === 'pepperoni' || groupKey === 'bacon') return 'classic';
  return groupKey;
}

export function serializeCustomPizzaConfig(settings, toppings) {
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
        sortOrder: t.sortOrder,
      })),
  };
}

export async function ensureCustomPizzaConfig(prisma) {
  const defaults = getDefaultCustomPizzaSettings();
  const settings = await prisma.customPizzaSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default', ...defaults },
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
      },
    });
  }

  const toppings = await prisma.customPizzaTopping.findMany({ orderBy: { sortOrder: 'asc' } });
  return serializeCustomPizzaConfig(settings, toppings);
}
