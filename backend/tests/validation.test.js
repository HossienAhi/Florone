const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  parseCustomPizzaItem,
  validateCustomPizza,
} = require("../lib/customPizzaOrder");

const settings = {
  basePriceMedium: 550000,
  basePriceFamily: 780000,
  familyToppingMultiplier: 1.3,
  minToppings: 3,
  maxToppings: 7,
};

const toppings = [
  { id: "marinara", name: "مارینارا", groupKey: "sauce", priceMedium: 0, available: true, isActive: true },
  { id: "gouda", name: "پنیر گودا", groupKey: "cheese", priceMedium: 0, available: true, isActive: true },
  { id: "ground-beef", name: "گوشت چرخ کرده", groupKey: "meat", priceMedium: 50000, available: true, isActive: true },
  { id: "mushroom", name: "قارچ", groupKey: "vegetable", priceMedium: 35000, available: true, isActive: true },
  { id: "olive", name: "زیتون", groupKey: "vegetable", priceMedium: 30000, available: false, isActive: true },
];

function makeItem(overrides = {}) {
  return {
    id: "custom-pizza",
    type: "custom_pizza",
    isCustomPizza: true,
    qty: 1,
    sizeCode: "medium",
    shapeCode: "square",
    toppingCodes: ["marinara", "gouda", "ground-beef"],
    expectedTotal: 600000,
    ...overrides,
  };
}

describe("validateCustomPizza", () => {
  it("accepts valid machine-readable payload", () => {
    const item = makeItem();
    const parsed = parseCustomPizzaItem(item, toppings);
    const result = validateCustomPizza(parsed, item, settings, toppings);
    assert.equal(result.ok, true);
    assert.equal(result.serverTotal, 600000);
    assert.ok(result.snapshot);
  });

  it("rejects duplicate toppings", () => {
    const item = makeItem({
      toppingCodes: ["marinara", "marinara", "gouda"],
    });
    const parsed = parseCustomPizzaItem(item, toppings);
    const result = validateCustomPizza(parsed, item, settings, toppings);
    assert.equal(result.ok, false);
    assert.equal(result.code, "INVALID_TOPPING");
  });

  it("rejects too few toppings", () => {
    const item = makeItem({
      toppingCodes: ["marinara", "gouda"],
      expectedTotal: 550000,
    });
    const parsed = parseCustomPizzaItem(item, toppings);
    const result = validateCustomPizza(parsed, item, settings, toppings);
    assert.equal(result.ok, false);
    assert.equal(result.code, "TOPPING_COUNT_OUT_OF_RANGE");
  });

  it("rejects unavailable topping", () => {
    const item = makeItem({
      toppingCodes: ["marinara", "gouda", "olive"],
      expectedTotal: 580000,
    });
    const parsed = parseCustomPizzaItem(item, toppings);
    const result = validateCustomPizza(parsed, item, settings, toppings);
    assert.equal(result.ok, false);
    assert.equal(result.code, "TOPPING_UNAVAILABLE");
    assert.ok(result.details.unavailable.includes("زیتون"));
  });

  it("rejects price mismatch", () => {
    const item = makeItem({ expectedTotal: 1 });
    const parsed = parseCustomPizzaItem(item, toppings);
    const result = validateCustomPizza(parsed, item, settings, toppings);
    assert.equal(result.ok, false);
    assert.equal(result.code, "PRICE_CHANGED");
    assert.equal(result.status, 409);
  });
});
