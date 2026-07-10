const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { calculateCustomPizzaTotal } = require("../lib/customPizzaPricing");
const {
  initTestEnvironment,
  stopTestEnvironment,
  api,
  loginAsCashier,
} = require("./helpers/setup");

let baseUrl;
let prisma;
let token;
let seedMenuItem;

const CUSTOM_PIZZA_TOPPINGS = ["marinara", "gouda", "ground-beef"];

function makeCustomPizzaItem(overrides = {}) {
  const settings = {
    basePriceMedium: 550000,
    basePriceFamily: 780000,
    familyToppingMultiplier: 1.3,
  };
  const toppingRows = CUSTOM_PIZZA_TOPPINGS.map((id) => ({
    id,
    priceMedium: id === "ground-beef" ? 50000 : 0,
  }));
  const expectedTotal = calculateCustomPizzaTotal("medium", toppingRows, settings);

  return {
    id: "custom-pizza",
    type: "custom_pizza",
    isCustomPizza: true,
    qty: 1,
    sizeCode: "medium",
    shapeCode: "square",
    toppingCodes: CUSTOM_PIZZA_TOPPINGS,
    expectedTotal,
    buildId: `build-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    ...overrides,
  };
}

function makeRegularOrder(tableId = 1, overrides = {}) {
  const price = seedMenuItem.price;
  return {
    tableId,
    items: [
      {
        id: seedMenuItem.id,
        name: seedMenuItem.name,
        price,
        qty: 1,
        lineTotal: price,
      },
    ],
    totalPrice: price,
    ...overrides,
  };
}

before(async () => {
  const env = await initTestEnvironment();
  baseUrl = env.baseUrl;
  prisma = env.prisma;
  token = await loginAsCashier(baseUrl);
  seedMenuItem = await prisma.menuItem.findFirst();
});

after(async () => {
  await stopTestEnvironment();
});

describe("Auth", () => {
  it("rejects invalid credentials", async () => {
    const res = await api(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { username: "wrong", password: "wrong" },
    });
    assert.equal(res.status, 401);
  });

  it("logs in successfully and returns token", async () => {
    const res = await api(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { username: "test-admin", password: "test-password-123" },
    });
    assert.equal(res.status, 200);
    assert.ok(res.json.token);
    assert.equal(res.json.username, "test-admin");
  });

  it("returns current user with valid token", async () => {
    const res = await api(baseUrl, "/api/auth/me", { token });
    assert.equal(res.status, 200);
    assert.equal(res.json.username, "test-admin");
  });

  it("rejects /api/auth/me without token", async () => {
    const res = await api(baseUrl, "/api/auth/me");
    assert.equal(res.status, 401);
  });

  it("invalidates session on logout", async () => {
    const loginRes = await api(baseUrl, "/api/auth/login", {
      method: "POST",
      body: { username: "test-admin", password: "test-password-123" },
    });
    const sessionToken = loginRes.json.token;

    const logoutRes = await api(baseUrl, "/api/auth/logout", {
      method: "POST",
      token: sessionToken,
    });
    assert.equal(logoutRes.status, 200);

    const meRes = await api(baseUrl, "/api/auth/me", { token: sessionToken });
    assert.equal(meRes.status, 401);
  });

  it("blocks protected endpoints without auth", async () => {
    const res = await api(baseUrl, "/menu-items", {
      method: "POST",
      body: { name: "بدون احراز", price: 100000, image: "https://example.com/x.jpg" },
    });
    assert.equal(res.status, 401);
  });
});

describe("Menu CRUD", () => {
  let createdItemId;

  it("lists menu items publicly", async () => {
    const res = await api(baseUrl, "/menu-items");
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.some((item) => item.name === seedMenuItem.name));
  });

  it("creates a menu item with auth", async () => {
    const res = await api(baseUrl, "/menu-items", {
      method: "POST",
      token,
      body: {
        name: "برگر تست",
        price: 280000,
        category: "burger",
        image: "https://example.com/burger.jpg",
      },
    });
    assert.equal(res.status, 201);
    assert.equal(res.json.name, "برگر تست");
    createdItemId = res.json.id;
  });

  it("rejects create without required fields", async () => {
    const res = await api(baseUrl, "/menu-items", {
      method: "POST",
      token,
      body: { name: "بدون قیمت" },
    });
    assert.equal(res.status, 400);
  });

  it("updates a menu item", async () => {
    const res = await api(baseUrl, `/menu-items/${createdItemId}`, {
      method: "PUT",
      token,
      body: { name: "برگر تست ویرایش‌شده", price: 290000 },
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.name, "برگر تست ویرایش‌شده");
    assert.equal(res.json.price, 290000);
  });

  it("returns 404 for updating non-existent item", async () => {
    const res = await api(baseUrl, "/menu-items/99999", {
      method: "PUT",
      token,
      body: { name: "ناموجود" },
    });
    assert.equal(res.status, 404);
  });

  it("blocks mutations without auth", async () => {
    const putRes = await api(baseUrl, `/menu-items/${createdItemId}`, {
      method: "PUT",
      body: { name: "هک" },
    });
    assert.equal(putRes.status, 401);

    const deleteRes = await api(baseUrl, `/menu-items/${createdItemId}`, {
      method: "DELETE",
    });
    assert.equal(deleteRes.status, 401);
  });

  it("deletes a menu item", async () => {
    const res = await api(baseUrl, `/menu-items/${createdItemId}`, {
      method: "DELETE",
      token,
    });
    assert.equal(res.status, 200);

    const listRes = await api(baseUrl, "/menu-items");
    assert.ok(!listRes.json.some((item) => item.id === createdItemId));
  });
});

describe("Orders", () => {
  let orderId;

  it("rejects incomplete order body", async () => {
    const res = await api(baseUrl, "/api/orders", {
      method: "POST",
      body: { tableId: 1 },
    });
    assert.equal(res.status, 400);
  });

  it("rejects order with wrong totalPrice", async () => {
    const body = makeRegularOrder(10, { totalPrice: 1 });
    const res = await api(baseUrl, "/api/orders", { method: "POST", body });
    assert.equal(res.status, 409);
    assert.equal(res.json.code, "PRICE_CHANGED");
  });

  it("places a regular order", async () => {
    const body = makeRegularOrder(10);
    const res = await api(baseUrl, "/api/orders", { method: "POST", body });
    assert.equal(res.status, 201);
    assert.ok(res.json.orderId);
    orderId = res.json.orderId;
  });

  it("returns order version info", async () => {
    const res = await api(baseUrl, "/api/orders/version");
    assert.equal(res.status, 200);
    assert.ok(typeof res.json.version === "number");
    assert.equal(res.json.hasUnread, true);
  });

  it("returns active orders grouped by table", async () => {
    const res = await api(baseUrl, "/api/orders");
    assert.equal(res.status, 200);
    assert.ok(res.json["10"]);
    assert.ok(res.json["10"].orders.some((o) => o.id === String(orderId)));
  });

  it("returns flat order list for cashier", async () => {
    const res = await api(baseUrl, "/api/orders/list", { token });
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.json));
    assert.ok(res.json.some((o) => o.id === String(orderId)));
  });

  it("acknowledges an order", async () => {
    const res = await api(baseUrl, `/api/orders/${orderId}/ack`, {
      method: "PATCH",
      token,
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.success, true);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    assert.equal(order.acknowledged, true);
  });

  it("confirms an order", async () => {
    const res = await api(baseUrl, `/api/orders/${orderId}/confirm`, {
      method: "PATCH",
      token,
    });
    assert.equal(res.status, 200);

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    assert.equal(order.status, "PREPARING");
  });

  it("closes a table", async () => {
    const res = await api(baseUrl, "/api/orders/close", {
      method: "POST",
      token,
      body: { tableId: 10 },
    });
    assert.equal(res.status, 200);
    assert.ok(res.json.closed >= 1);

    const table = await prisma.restaurantTable.findUnique({ where: { id: 10 } });
    assert.equal(table.status, "EMPTY");
  });

  it("rejects closing invalid table", async () => {
    const res = await api(baseUrl, "/api/orders/close", {
      method: "POST",
      token,
      body: { tableId: 99999 },
    });
    assert.equal(res.status, 400);
  });

  it("rejects an order", async () => {
    const placeRes = await api(baseUrl, "/api/orders", {
      method: "POST",
      body: makeRegularOrder(11),
    });
    const rejectOrderId = placeRes.json.orderId;

    const res = await api(baseUrl, `/api/orders/${rejectOrderId}/reject`, {
      method: "PATCH",
      token,
    });
    assert.equal(res.status, 200);

    const order = await prisma.order.findUnique({ where: { id: rejectOrderId } });
    assert.equal(order.status, "CLOSED");
  });
});

describe("Custom pizza", () => {
  it("returns public config", async () => {
    const res = await api(baseUrl, "/api/custom-pizza/config");
    assert.equal(res.status, 200);
    assert.ok(res.json.settings);
    assert.ok(Array.isArray(res.json.toppings));
    assert.ok(res.json.toppings.length > 0);
  });

  it("requires idempotency key for custom pizza orders", async () => {
    const item = makeCustomPizzaItem();
    delete item.buildId;
    const res = await api(baseUrl, "/api/orders", {
      method: "POST",
      body: {
        tableId: 20,
        items: [item],
        totalPrice: item.expectedTotal,
      },
    });
    assert.equal(res.status, 400);
    assert.equal(res.json.code, "IDEMPOTENCY_KEY_REQUIRED");
  });

  it("places a valid custom pizza order", async () => {
    const item = makeCustomPizzaItem();
    const res = await api(baseUrl, "/api/orders", {
      method: "POST",
      idempotencyKey: `key-${item.buildId}`,
      body: {
        tableId: 20,
        items: [item],
        totalPrice: item.expectedTotal,
      },
    });
    assert.equal(res.status, 201);
    assert.ok(res.json.orderId);
  });

  it("rejects duplicate toppings", async () => {
    const item = makeCustomPizzaItem({
      toppingCodes: ["marinara", "marinara", "gouda"],
    });
    const res = await api(baseUrl, "/api/orders", {
      method: "POST",
      idempotencyKey: `dup-${item.buildId}`,
      body: {
        tableId: 21,
        items: [item],
        totalPrice: item.expectedTotal,
      },
    });
    assert.equal(res.status, 422);
    assert.equal(res.json.code, "INVALID_TOPPING");
  });

  it("rejects too few toppings", async () => {
    const item = makeCustomPizzaItem({ toppingCodes: ["marinara", "gouda"] });
    const res = await api(baseUrl, "/api/orders", {
      method: "POST",
      idempotencyKey: `few-${item.buildId}`,
      body: {
        tableId: 22,
        items: [item],
        totalPrice: item.expectedTotal,
      },
    });
    assert.equal(res.status, 422);
    assert.equal(res.json.code, "TOPPING_COUNT_OUT_OF_RANGE");
  });

  it("updates custom pizza config as cashier", async () => {
    const configRes = await api(baseUrl, "/api/custom-pizza/config");
    const { settings, toppings } = configRes.json;

    const res = await api(baseUrl, "/api/custom-pizza/config", {
      method: "PUT",
      token,
      body: {
        settings: { ...settings, basePriceMedium: 560000 },
        toppings,
      },
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.settings.basePriceMedium, 560000);

    await api(baseUrl, "/api/custom-pizza/config", {
      method: "PUT",
      token,
      body: { settings, toppings },
    });
  });

  it("patches a topping", async () => {
    const res = await api(baseUrl, "/api/admin/toppings/marinara", {
      method: "PATCH",
      token,
      body: { available: false },
    });
    assert.equal(res.status, 200);
    assert.equal(res.json.isAvailable, false);

    await api(baseUrl, "/api/admin/toppings/marinara", {
      method: "PATCH",
      token,
      body: { available: true },
    });
  });

  it("returns 404 for invalid topping patch", async () => {
    const res = await api(baseUrl, "/api/admin/toppings/invalid-topping", {
      method: "PATCH",
      token,
      body: { available: false },
    });
    assert.equal(res.status, 404);
  });
});

describe("Concurrent requests", () => {
  it("deduplicates concurrent custom pizza orders with same idempotency key", async () => {
    await prisma.restaurantTable.upsert({
      where: { id: 30 },
      create: { id: 30, code: "T30", label: "میز 30", status: "EMPTY" },
      update: {},
    });

    const item = makeCustomPizzaItem({ buildId: "concurrent-idem-build" });
    const idempotencyKey = "concurrent-idem-key";
    const body = {
      tableId: 30,
      items: [item],
      totalPrice: item.expectedTotal,
    };

    const beforeCount = await prisma.order.count();

    const responses = await Promise.all(
      Array.from({ length: 10 }, () =>
        api(baseUrl, "/api/orders", {
          method: "POST",
          idempotencyKey,
          body,
        })
      )
    );

    for (const res of responses) {
      assert.equal(res.status, 201);
      assert.equal(res.json.orderId, responses[0].json.orderId);
    }

    const afterCount = await prisma.order.count();
    assert.equal(afterCount, beforeCount + 1);
  });

  it("handles parallel orders on different tables", async () => {
    const beforeCount = await prisma.order.count();

    const responses = await Promise.all(
      [1, 2, 3, 4, 5].map((tableId) =>
        api(baseUrl, "/api/orders", {
          method: "POST",
          body: makeRegularOrder(40 + tableId),
        })
      )
    );

    for (const res of responses) {
      assert.equal(res.status, 201);
      assert.ok(res.json.orderId);
    }

    const orderIds = new Set(responses.map((r) => r.json.orderId));
    assert.equal(orderIds.size, 5);

    const afterCount = await prisma.order.count();
    assert.equal(afterCount, beforeCount + 5);
  });

  it("reads menu concurrently while creating an item", async () => {
    const requests = [
      ...Array.from({ length: 8 }, () => api(baseUrl, "/menu-items")),
      api(baseUrl, "/menu-items", {
        method: "POST",
        token,
        body: {
          name: "آیتم همزمان",
          price: 150000,
          image: "https://example.com/concurrent.jpg",
        },
      }),
    ];

    const responses = await Promise.all(requests);
    for (const res of responses) {
      assert.ok(res.status < 500, `unexpected server error: ${res.status}`);
    }
    assert.equal(responses[8].status, 201);
  });

  it("polls order version while placing orders", async () => {
    const orderPromise = api(baseUrl, "/api/orders", {
      method: "POST",
      body: makeRegularOrder(50),
    });
    const versionPromises = Array.from({ length: 5 }, () =>
      api(baseUrl, "/api/orders/version")
    );

    const [orderRes, ...versionResponses] = await Promise.all([
      orderPromise,
      ...versionPromises,
    ]);

    assert.equal(orderRes.status, 201);
    for (const res of versionResponses) {
      assert.equal(res.status, 200);
      assert.ok(typeof res.json.version === "number");
    }
  });

  it("handles concurrent logins", async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, () =>
        api(baseUrl, "/api/auth/login", {
          method: "POST",
          body: { username: "test-admin", password: "test-password-123" },
        })
      )
    );

    for (const res of responses) {
      assert.equal(res.status, 200);
      assert.ok(res.json.token);
    }
  });
});
