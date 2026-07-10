import { formatToman } from './price';

export const PIZZA_BUILDER_CONFIG = {
  minToppings: 3,
  maxToppings: 7,
  basePrices: { medium: 550_000, family: 780_000 },
  sizeScale: { medium: 0.85, family: 1 },
  familyToppingMultiplier: 1.3,
  customPizzaId: 'custom-pizza',
};

export const PIZZA_SHAPE_LABELS = {
  circle: 'دایره‌ای',
  square: 'مربعی',
};

export const PIZZA_SIZE_LABELS = {
  medium: 'متوسط',
  family: 'خانواده',
};

/** Size → allowed shape (the other shape is disabled, not hidden) */
export const SIZE_SHAPE_RULE = {
  medium: 'square',
  family: 'circle',
};

export const TOPPING_GROUP_ORDER = [
  'sauce',
  'meat',
  'classic',
  'chicken',
  'vegetable',
  'cheese',
];

export const TOPPING_GROUP_LABELS = {
  sauce: 'سس کف پیتزا',
  cheese: 'پنیر پیتزا',
  meat: 'گوشت',
  classic: 'کلاسیک',
  chicken: 'مرغ',
  vegetable: 'سبزیجات',
};

/** single = only one pick per group; multi = several allowed */
export const TOPPING_GROUP_MODE = {
  sauce: 'single',
  cheese: 'single',
  meat: 'multi',
  classic: 'multi',
  chicken: 'multi',
  vegetable: 'multi',
};

/** Legacy group keys → current (DB/API migration) */
export const LEGACY_TOPPING_GROUP_MAP = {
  pepperoni: 'classic',
  bacon: 'classic',
};

export function normalizeToppingGroup(group) {
  return LEGACY_TOPPING_GROUP_MAP[group] ?? group;
}

/** Groups whose emoji appears as scattered pieces on the pizza */
export const VISUAL_TOPPING_GROUPS = new Set([
  'meat',
  'classic',
  'chicken',
  'vegetable',
]);

/** Sauce base colors on the pizza disk (opacity applied in CSS) */
export const SAUCE_VISUAL = {
  alfredo: { color: '#f6efe4', edge: '#ddd0b8', opacity: 0.58 },
  marinara: { color: '#d42b1f', edge: '#9a1a12', opacity: 0.55 },
  pesto: { color: '#2f6b42', edge: '#1e4a2c', opacity: 0.52 },
  garlic: { color: '#f2ebd8', edge: '#cfc4a0', opacity: 0.56 },
};

/** Cheese melt overlay */
export const CHEESE_VISUAL = {
  gouda: { color: 'rgba(255, 196, 72, 0.62)', edge: 'rgba(230, 160, 40, 0.35)' },
  marta: { color: 'rgba(255, 228, 160, 0.58)', edge: 'rgba(220, 180, 100, 0.32)' },
};

export const PIZZA_TOPPINGS = [
  { id: 'alfredo', name: 'آلفردو', emoji: '🥛', price: 0, group: 'sauce', available: true },
  { id: 'marinara', name: 'مارینارا', emoji: '🍅', price: 0, group: 'sauce', available: true },
  { id: 'pesto', name: 'پستو', emoji: '🌿', price: 0, group: 'sauce', available: true },
  { id: 'garlic', name: 'سیر', emoji: '🧄', price: 0, group: 'sauce', available: true },
  { id: 'gouda', name: 'پنیر گودا', emoji: '🧀', price: 0, group: 'cheese', available: true },
  { id: 'marta', name: 'پنیر مارتا', emoji: '🧀', price: 0, group: 'cheese', available: true },
  { id: 'ground-beef', name: 'گوشت چرخ کرده', emoji: '🥩', price: 50_000, group: 'meat', available: true },
  { id: 'roast-beef', name: 'رست بیف', emoji: '🍖', price: 60_000, group: 'meat', available: true },
  { id: 'steak', name: 'گوشت استیک', emoji: '🥩', price: 70_000, group: 'meat', available: true },
  { id: 'pepperoni', name: 'پپرونی', emoji: '🍕', price: 55_000, group: 'classic', available: true },
  { id: 'bacon', name: 'بیکن', emoji: '🥓', price: 50_000, group: 'classic', available: true },
  { id: 'curry-chicken', name: 'مرغ کاری', emoji: '🍛', price: 45_000, group: 'chicken', available: true },
  { id: 'plain-chicken', name: 'مرغ ساده', emoji: '🍗', price: 40_000, group: 'chicken', available: true },
  { id: 'bell-pepper', name: 'فلفل دلمه', emoji: '🫑', price: 20_000, group: 'vegetable', available: true },
  { id: 'olive', name: 'زیتون', emoji: '🫒', price: 30_000, group: 'vegetable', available: true },
  { id: 'mushroom', name: 'قارچ', emoji: '🍄', price: 35_000, group: 'vegetable', available: true },
  { id: 'onion', name: 'پیاز', emoji: '🧅', price: 18_000, group: 'vegetable', available: true },
  { id: 'jalapeno', name: 'هالوپینو', emoji: '🌶️', price: 24_000, group: 'vegetable', available: true },
];

function seedHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Visual density on the pizza disk */
export const TOPPING_VISUAL_PROFILE = {
  default: {
    pieceCount: 14,
    minRadius: 10,
    maxRadius: 30,
    edgeMargin: 13,
    scaleMin: 0.82,
    scaleRange: 0.35,
    flyImgScale: 1,
  },
  fine: {
    pieceCount: 40,
    edgeMargin: 18,
    scaleMin: 0.95,
    scaleRange: 0.28,
    flyImgScale: 1.35,
  },
  chicken: {
    pieceCount: 44,
    edgeMargin: 18,
    scaleMin: 0.92,
    scaleRange: 0.3,
    flyImgScale: 1.3,
  },
};

/** Toppings that should scatter as many small pieces across the whole pizza */
export const TOPPING_VISUAL_TYPE = {
  'ground-beef': 'fine',
  'curry-chicken': 'chicken',
  'plain-chicken': 'chicken',
};

export function getToppingVisualType(toppingId) {
  return TOPPING_VISUAL_TYPE[toppingId] ?? 'default';
}

export function getToppingVisualProfile(toppingId) {
  return TOPPING_VISUAL_PROFILE[getToppingVisualType(toppingId)];
}

export function getToppingPieceCount(toppingId, overrideCount) {
  if (overrideCount != null) return overrideCount;
  return getToppingVisualProfile(toppingId).pieceCount;
}

function clampToPizzaShape(left, top, margin, shape = 'circle') {
  if (shape === 'square') {
    return {
      left: Math.min(100 - margin, Math.max(margin, left)),
      top: Math.min(100 - margin, Math.max(margin, top)),
    };
  }
  const dx = left - 50;
  const dy = top - 50;
  const dist = Math.hypot(dx, dy);
  const maxDist = 50 - margin;
  if (dist <= maxDist) return { left, top };
  const scale = maxDist / dist;
  return { left: 50 + dx * scale, top: 50 + dy * scale };
}

function getSpreadSunflowerPositions(toppingId, pieceCount, margin, visualType) {
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const base = seedHash(toppingId);
  const maxDist = 50 - margin - 2;
  const minDist = 6;
  const delayStep = visualType === 'chicken' ? 0.018 : 0.02;
  const positions = [];

  for (let i = 0; i < pieceCount; i++) {
    const h = seedHash(`${toppingId}-${i}`);
    const t = (i + 0.5) / pieceCount;
    const angle = i * goldenAngle + (base % 32) * 0.028;
    const radius = minDist + (maxDist - minDist) * t;
    const jitterR = ((h % 7) - 3) * 0.3;
    let left = 50 + Math.cos(angle) * (radius + jitterR);
    let top = 50 + Math.sin(angle) * (radius + jitterR);
    ({ left, top } = clampToPizzaShape(left, top, margin + 2, 'circle'));

    positions.push({
      left,
      top,
      rotate: (h % 50) - 25,
      delay: i * delayStep,
    });
  }
  return positions;
}

function getSpreadGridPositions(toppingId, pieceCount, margin, visualType) {
  const cols = Math.ceil(Math.sqrt(pieceCount * 1.08));
  const rows = Math.ceil(pieceCount / cols);
  const innerW = 100 - 2 * margin;
  const innerH = 100 - 2 * margin;
  const cellW = innerW / cols;
  const cellH = innerH / rows;
  const delayStep = visualType === 'chicken' ? 0.018 : 0.02;
  const positions = [];

  for (let i = 0; i < pieceCount; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const h = seedHash(`${toppingId}-${i}`);
    const jitterX = ((h % 9) - 4) * cellW * 0.16;
    const jitterY = (((h >> 4) % 9) - 4) * cellH * 0.16;

    let left = margin + cellW * (col + 0.5) + jitterX;
    let top = margin + cellH * (row + 0.5) + jitterY;
    ({ left, top } = clampToPizzaShape(left, top, margin + 2, 'square'));

    positions.push({
      left,
      top,
      rotate: (h % 50) - 25,
      delay: i * delayStep,
    });
  }
  return positions;
}

function getRingPositions(toppingId, pieceCount, profile, shape) {
  const base = seedHash(toppingId);
  const margin = profile.edgeMargin ?? 13;
  const ringCount = Math.max(2, Math.round(Math.sqrt(pieceCount / 2)));
  const positions = [];
  let placed = 0;

  for (let ring = 0; ring < ringCount && placed < pieceCount; ring++) {
    const ringT = (ring + 1) / ringCount;
    const radius = profile.minRadius + (profile.maxRadius - profile.minRadius) * ringT;
    const remaining = pieceCount - placed;
    const ringsLeft = ringCount - ring;
    const inRing = ring < ringCount - 1
      ? Math.max(1, Math.ceil(remaining / ringsLeft))
      : remaining;

    for (let j = 0; j < inRing && placed < pieceCount; j++) {
      const h = seedHash(`${toppingId}-${placed}`);
      const angle = (j / inRing) * Math.PI * 2
        + ring * (Math.PI / ringCount)
        + (base % 36) * 0.035;
      const jitterR = ((h % 5) - 2) * 0.45;
      let left = 50 + Math.cos(angle) * (radius + jitterR);
      let top = 50 + Math.sin(angle) * (radius + jitterR);
      ({ left, top } = clampToPizzaShape(left, top, margin, shape));

      positions.push({
        left,
        top,
        rotate: (h % 60) - 30,
        delay: placed * 0.04,
      });
      placed += 1;
    }
  }
  return positions;
}

export function getToppingPositions(toppingId, count, shape = 'circle') {
  const profile = getToppingVisualProfile(toppingId);
  const pieceCount = count ?? profile.pieceCount;
  const visualType = getToppingVisualType(toppingId);
  const isSpread = visualType === 'fine' || visualType === 'chicken';

  if (isSpread) {
    const margin = profile.edgeMargin ?? 18;
    return shape === 'square'
      ? getSpreadGridPositions(toppingId, pieceCount, margin, visualType)
      : getSpreadSunflowerPositions(toppingId, pieceCount, margin, visualType);
  }
  return getRingPositions(toppingId, pieceCount, profile, shape);
}

const QUEUE_META_GROUPS = new Set(['خمیر', 'شکل', 'سایز', '_build']);

export function summarizeCustomPizzaItem(item) {
  const opts = item?.options ?? [];
  const shape = opts.find((o) => o.group === 'شکل')?.label ?? '';
  const size = opts.find((o) => o.group === 'سایز')?.label ?? '';
  const toppingCount = opts.filter((o) => !QUEUE_META_GROUPS.has(o.group)).length;
  return {
    shape,
    size,
    toppingCount,
    label: [size, shape].filter(Boolean).join(' · '),
  };
}

export function getToppingPrice(topping, size, settings) {
  const base = topping.priceMedium ?? topping.price ?? 0;
  if (size === 'family') {
    const mult = settings?.familyToppingMultiplier
      ?? PIZZA_BUILDER_CONFIG.familyToppingMultiplier;
    return Math.round(base * mult);
  }
  return base;
}

export function calcCustomPizzaPrice(size, selectedToppings, settings) {
  const basePrices = settings?.basePrices ?? PIZZA_BUILDER_CONFIG.basePrices;
  const base = basePrices[size] ?? basePrices.medium;
  const toppingsTotal = selectedToppings.reduce(
    (sum, t) => sum + getToppingPrice(t, size, settings),
    0
  );
  return base + toppingsTotal;
}

/** Ensures new seed toppings (e.g. jalapeno) appear even with stale API/cache data */
export function mergeToppingsWithDefaults(apiToppings) {
  const byId = new Map((apiToppings ?? []).map((t) => [t.id, t]));
  return PIZZA_TOPPINGS.map((def, i) => {
    const api = byId.get(def.id);
    return {
      id: def.id,
      name: api?.name ?? def.name,
      emoji: api?.emoji ?? def.emoji,
      group: normalizeToppingGroup(api?.group ?? def.group),
      priceMedium: api?.priceMedium ?? def.price,
      available: api?.available ?? def.available,
      sortOrder: api?.sortOrder ?? i,
    };
  });
}

export function normalizeCustomPizzaConfig(payload) {
  if (!payload?.settings) return null;
  const s = payload.settings;
  return {
    basePrices: {
      medium: s.basePriceMedium,
      family: s.basePriceFamily,
    },
    familyToppingMultiplier: s.familyToppingMultiplier,
    minToppings: s.minToppings ?? PIZZA_BUILDER_CONFIG.minToppings,
    maxToppings: s.maxToppings ?? PIZZA_BUILDER_CONFIG.maxToppings,
    sizeScale: PIZZA_BUILDER_CONFIG.sizeScale,
    customPizzaId: PIZZA_BUILDER_CONFIG.customPizzaId,
    toppings: mergeToppingsWithDefaults(payload.toppings).map((t) => ({
      id: t.id,
      name: t.name,
      emoji: t.emoji,
      group: t.group,
      price: t.priceMedium,
      priceMedium: t.priceMedium,
      available: t.available,
    })),
  };
}

/** Admin/API payload — merged seed + DB with family prices */
export function formatToppingsForApi(apiToppings, familyMultiplier = PIZZA_BUILDER_CONFIG.familyToppingMultiplier) {
  const mult = familyMultiplier ?? PIZZA_BUILDER_CONFIG.familyToppingMultiplier;
  return mergeToppingsWithDefaults(apiToppings).map((t, i) => ({
    id: t.id,
    name: t.name,
    emoji: t.emoji,
    group: normalizeToppingGroup(t.group),
    priceMedium: t.priceMedium,
    priceFamily: Math.round(t.priceMedium * mult),
    available: t.available,
    sortOrder: t.sortOrder ?? i,
  }));
}

export function createBuildId() {
  return `build-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function buildCustomPizzaCartItem({ shape, size, selectedToppings, buildId, settings }) {
  const unitPrice = calcCustomPizzaPrice(size, selectedToppings, settings);
  const resolvedBuildId = buildId ?? createBuildId();
  const toppingCodes = selectedToppings.map((t) => t.id);
  const options = [
    { group: 'خمیر', label: 'نوع ثابت' },
    { group: 'شکل', label: PIZZA_SHAPE_LABELS[shape] },
    { group: 'سایز', label: PIZZA_SIZE_LABELS[size] },
    ...selectedToppings.map((t) => ({
      group: TOPPING_GROUP_LABELS[t.group] || 'تاپینگ',
      label: t.name,
    })),
    { group: '_build', label: resolvedBuildId },
  ];
  return {
    id: PIZZA_BUILDER_CONFIG.customPizzaId,
    name: 'پیتزای سفارشی',
    type: 'custom_pizza',
    isCustomPizza: true,
    buildId: resolvedBuildId,
    sizeCode: size,
    shapeCode: shape,
    toppingCodes,
    expectedTotal: unitPrice,
    qty: 1,
    unitPrice,
    lineTotal: unitPrice,
    options,
  };
}

export function formatPriceLabel(price) {
  return `${formatToman(price)} تومان`;
}

export function isShapeDisabledForSize(shape, size) {
  return SIZE_SHAPE_RULE[size] !== shape;
}
