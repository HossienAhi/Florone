/** Business constants — keep in sync with florone-app/src/data/customPizzaData.js */

const MIN_TOPPINGS = 3;
const MAX_TOPPINGS = 7;

const SIZE_CODES = ["medium", "family"];
const SHAPE_CODES = ["square", "circle"];

const SIZE_SHAPE_RULE = {
  medium: "square",
  family: "circle",
};

const SIZE_LABELS = {
  medium: "متوسط",
  family: "خانواده",
};

const SHAPE_LABELS = {
  square: "مربعی",
  circle: "دایره‌ای",
};

const REVERSE_SIZE_LABELS = Object.fromEntries(
  Object.entries(SIZE_LABELS).map(([k, v]) => [v, k])
);

const REVERSE_SHAPE_LABELS = Object.fromEntries(
  Object.entries(SHAPE_LABELS).map(([k, v]) => [v, k])
);

const TOPPING_GROUP_LABELS = {
  sauce: "سس کف پیتزا",
  cheese: "پنیر پیتزا",
  meat: "گوشت",
  classic: "کلاسیک",
  chicken: "مرغ",
  vegetable: "سبزیجات",
};

const REVERSE_GROUP_LABELS = Object.fromEntries(
  Object.entries(TOPPING_GROUP_LABELS).map(([k, v]) => [v, k])
);

const SINGLE_PICK_GROUPS = new Set(["sauce", "cheese"]);

const META_OPTION_GROUPS = new Set(["خمیر", "شکل", "سایز", "_build"]);

const CUSTOM_PIZZA_ID = "custom-pizza";

const IDEMPOTENCY_TTL_MS = 24 * 60 * 60 * 1000;

module.exports = {
  MIN_TOPPINGS,
  MAX_TOPPINGS,
  SIZE_CODES,
  SHAPE_CODES,
  SIZE_SHAPE_RULE,
  SIZE_LABELS,
  SHAPE_LABELS,
  REVERSE_SIZE_LABELS,
  REVERSE_SHAPE_LABELS,
  TOPPING_GROUP_LABELS,
  REVERSE_GROUP_LABELS,
  SINGLE_PICK_GROUPS,
  META_OPTION_GROUPS,
  CUSTOM_PIZZA_ID,
  IDEMPOTENCY_TTL_MS,
};
