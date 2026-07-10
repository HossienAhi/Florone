const {
  CUSTOM_PIZZA_ID,
  MIN_TOPPINGS,
  MAX_TOPPINGS,
  SIZE_SHAPE_RULE,
  REVERSE_SIZE_LABELS,
  REVERSE_SHAPE_LABELS,
  REVERSE_GROUP_LABELS,
  SINGLE_PICK_GROUPS,
  META_OPTION_GROUPS,
  SIZE_LABELS,
  SHAPE_LABELS,
} = require("./customPizzaConstants");
const { buildPriceBreakdown, calculateCustomPizzaTotal } = require("./customPizzaPricing");

function isCustomPizzaItem(item) {
  if (!item) return false;
  if (item.type === "custom_pizza") return true;
  if (item.isCustomPizza) return true;
  if (item.id === CUSTOM_PIZZA_ID) return true;
  return false;
}

function normalizeGroupKey(groupKey) {
  if (groupKey === "pepperoni" || groupKey === "bacon") return "classic";
  return groupKey;
}

function parseFromMachineFields(item) {
  if (!item.sizeCode || !Array.isArray(item.toppingCodes)) return null;
  return {
    sizeCode: item.sizeCode,
    shapeCode: item.shapeCode || SIZE_SHAPE_RULE[item.sizeCode] || "square",
    toppingCodes: [...new Set(item.toppingCodes.map(String))],
    quantity: Math.max(1, Number(item.qty) || 1),
    buildId: item.buildId || item.options?.find((o) => o.group === "_build")?.label,
  };
}

function parseFromOptions(item, toppingByName) {
  const opts = item.options || [];
  const sizeLabel = opts.find((o) => o.group === "سایز")?.label;
  const shapeLabel = opts.find((o) => o.group === "شکل")?.label;
  const sizeCode = REVERSE_SIZE_LABELS[sizeLabel];
  const shapeCode = REVERSE_SHAPE_LABELS[shapeLabel];
  if (!sizeCode) return null;

  const toppingCodes = [];
  for (const o of opts) {
    if (META_OPTION_GROUPS.has(o.group)) continue;
    const groupKey = REVERSE_GROUP_LABELS[o.group];
    if (!groupKey) continue;
    const match = toppingByName.get(o.label);
    if (match) toppingCodes.push(match.id);
  }

  return {
    sizeCode,
    shapeCode: shapeCode || SIZE_SHAPE_RULE[sizeCode],
    toppingCodes: [...new Set(toppingCodes)],
    quantity: Math.max(1, Number(item.qty) || 1),
    buildId: opts.find((o) => o.group === "_build")?.label,
  };
}

function parseCustomPizzaItem(item, toppings) {
  const toppingByName = new Map(toppings.map((t) => [t.name, t]));
  return parseFromMachineFields(item) || parseFromOptions(item, toppingByName);
}

function validateCustomPizza(parsed, item, settings, toppings) {
  const toppingById = new Map(toppings.map((t) => [t.id, t]));
  const errors = [];

  if (!parsed?.sizeCode) {
    return { ok: false, code: "INVALID_SIZE", error: "سایز پیتزا نامعتبر است" };
  }

  if (!["medium", "family"].includes(parsed.sizeCode)) {
    return { ok: false, code: "INVALID_SIZE", error: "سایز پیتزا نامعتبر است" };
  }

  const expectedShape = SIZE_SHAPE_RULE[parsed.sizeCode];
  if (parsed.shapeCode && parsed.shapeCode !== expectedShape) {
    return {
      ok: false,
      code: "INVALID_SIZE",
      error: `شکل ${SHAPE_LABELS[parsed.shapeCode]} با سایز ${SIZE_LABELS[parsed.sizeCode]} سازگار نیست`,
    };
  }

  const rawCodes = item.toppingCodes ?? parsed?.toppingCodes ?? [];
  if (rawCodes.length !== new Set(rawCodes.map(String)).size) {
    return { ok: false, code: "INVALID_TOPPING", error: "تاپینگ تکراری مجاز نیست" };
  }

  const codes = parsed.toppingCodes || [];
  if (codes.length !== new Set(codes).size) {
    return { ok: false, code: "INVALID_TOPPING", error: "تاپینگ تکراری مجاز نیست" };
  }

  const minT = settings.minToppings ?? MIN_TOPPINGS;
  const maxT = settings.maxToppings ?? MAX_TOPPINGS;
  if (codes.length < minT || codes.length > maxT) {
    return {
      ok: false,
      code: "TOPPING_COUNT_OUT_OF_RANGE",
      error: `تعداد تاپینگ باید بین ${minT} تا ${maxT} باشد`,
      details: { minToppings: minT, maxToppings: maxT, count: codes.length },
    };
  }

  const invalidCodes = codes.filter((c) => !toppingById.has(c));
  if (invalidCodes.length > 0) {
    return {
      ok: false,
      code: "INVALID_TOPPING",
      error: "تاپینگ نامعتبر است",
      details: { invalidCodes },
    };
  }

  const unavailable = codes
    .filter((c) => {
      const t = toppingById.get(c);
      return !t || !t.available || t.isActive === false;
    })
    .map((c) => toppingById.get(c)?.name || c);

  if (unavailable.length > 0) {
    return {
      ok: false,
      code: "TOPPING_UNAVAILABLE",
      error: "برخی تاپینگ‌ها موجود نیستند",
      details: { unavailable },
    };
  }

  const byGroup = {};
  for (const code of codes) {
    const t = toppingById.get(code);
    const g = normalizeGroupKey(t.groupKey);
    if (!byGroup[g]) byGroup[g] = [];
    byGroup[g].push(code);
  }

  for (const g of SINGLE_PICK_GROUPS) {
    if (byGroup[g]?.length > 1) {
      return {
        ok: false,
        code: "INVALID_TOPPING",
        error: `فقط یک انتخاب در گروه ${g} مجاز است`,
      };
    }
  }

  const rows = codes.map((c) => toppingById.get(c));
  const breakdown = buildPriceBreakdown(parsed.sizeCode, rows, settings, parsed.quantity);
  const expectedTotal = Number(item.expectedTotal ?? item.lineTotal ?? item.unitPrice ?? item.price);
  const serverTotal = breakdown.lineTotal;

  if (!Number.isFinite(expectedTotal) || expectedTotal !== serverTotal) {
    return {
      ok: false,
      code: "PRICE_CHANGED",
      error: "قیمت تغییر کرده است",
      status: 409,
      serverTotal,
      breakdown,
    };
  }

  const snapshot = {
    type: "custom_pizza",
    sizeCode: parsed.sizeCode,
    sizeLabel: SIZE_LABELS[parsed.sizeCode],
    shapeCode: parsed.shapeCode || expectedShape,
    shapeLabel: SHAPE_LABELS[parsed.shapeCode || expectedShape],
    basePrice: breakdown.basePrice,
    toppingMultiplierBps: breakdown.toppingMultiplierBps,
    toppings: breakdown.toppings,
    itemTotal: breakdown.itemTotal,
    quantity: breakdown.quantity,
    lineTotal: breakdown.lineTotal,
    roundingRule: "NONE",
    buildId: parsed.buildId,
    capturedAt: new Date().toISOString(),
  };

  return { ok: true, parsed, breakdown, snapshot, serverTotal };
}

function enrichCustomPizzaItem(item, validation) {
  return {
    ...item,
    type: "custom_pizza",
    isCustomPizza: true,
    sizeCode: validation.parsed.sizeCode,
    shapeCode: validation.parsed.shapeCode,
    toppingCodes: validation.parsed.toppingCodes,
    expectedTotal: validation.serverTotal,
    unitPrice: validation.breakdown.itemTotal,
    lineTotal: validation.serverTotal,
    price: validation.serverTotal,
    snapshot: validation.snapshot,
  };
}

function buildOptionsPayload(settings, toppings) {
  const bpsFamily = Math.round((settings.familyToppingMultiplier || 1.3) * 100);
  return {
    sizes: [
      {
        code: "medium",
        label: SIZE_LABELS.medium,
        basePrice: settings.basePriceMedium,
        toppingMultiplierBps: 100,
        isActive: true,
        sortOrder: 0,
      },
      {
        code: "family",
        label: SIZE_LABELS.family,
        basePrice: settings.basePriceFamily,
        toppingMultiplierBps: bpsFamily,
        isActive: true,
        sortOrder: 1,
      },
    ],
    toppings: toppings
      .filter((t) => t.isActive !== false)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((t) => ({
        code: t.id,
        label: t.name,
        category: normalizeGroupKey(t.groupKey),
        unitPrice: t.priceMedium,
        isActive: t.isActive !== false,
        isAvailable: t.available,
        sortOrder: t.sortOrder,
      })),
    constraints: {
      minToppings: settings.minToppings ?? MIN_TOPPINGS,
      maxToppings: settings.maxToppings ?? MAX_TOPPINGS,
    },
  };
}

module.exports = {
  isCustomPizzaItem,
  parseCustomPizzaItem,
  validateCustomPizza,
  enrichCustomPizzaItem,
  buildOptionsPayload,
  calculateCustomPizzaTotal,
};
