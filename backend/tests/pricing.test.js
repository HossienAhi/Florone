const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  roundNearest10k,
  calculateToppingPrice,
  calculateCustomPizzaTotal,
} = require("../lib/customPizzaPricing");

const settings = {
  basePriceMedium: 550000,
  basePriceFamily: 780000,
  familyToppingMultiplier: 1.3,
};

describe("roundNearest10k", () => {
  it("rounds zero", () => {
    assert.equal(roundNearest10k(0), 0);
  });
  it("rounds midpoint 5000 up", () => {
    assert.equal(roundNearest10k(5000), 10000);
    assert.equal(roundNearest10k(15000), 20000);
  });
  it("rounds exact multiples", () => {
    assert.equal(roundNearest10k(10000), 10000);
    assert.equal(roundNearest10k(149999), 150000);
  });
  it("rounds large values", () => {
    assert.equal(roundNearest10k(1234567), 1230000);
  });
});

describe("calculateToppingPrice", () => {
  it("medium bps=100", () => {
    assert.equal(calculateToppingPrice(50000, 100), 50000);
  });
  it("family bps=130", () => {
    assert.equal(calculateToppingPrice(50000, 130), 65000);
  });
});

describe("calculateCustomPizzaTotal", () => {
  const toppings = [{ priceMedium: 50000 }, { priceMedium: 40000 }];

  it("medium base + toppings", () => {
    assert.equal(calculateCustomPizzaTotal("medium", toppings, settings), 640000);
  });

  it("family with multiplier", () => {
    assert.equal(calculateCustomPizzaTotal("family", toppings, settings), 897000);
  });

  it("respects quantity", () => {
    assert.equal(calculateCustomPizzaTotal("medium", toppings, settings, 2), 1280000);
  });
});
