const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");
const { ensureCustomPizzaConfig, serializeCustomPizzaConfig } = require("./customPizzaConfig");
const {
  isCustomPizzaItem,
  parseCustomPizzaItem,
  validateCustomPizza,
  enrichCustomPizzaItem,
  buildOptionsPayload,
} = require("./lib/customPizzaOrder");
const {
  resolveIdempotencyKey,
  hasCustomPizza,
  getCachedResponse,
  storeResponse,
} = require("./lib/idempotency");

function sendStructuredError(res, status, code, message, extra = {}) {
  return res.status(status).json({ code, error: message, ...extra });
}

const app = express();
const prisma = new PrismaClient();
const uploadsDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${extension}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("فقط فایل تصویری مجاز است"));
    }

    cb(null, true);
  },
});

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

// ── Cashier auth (credentials in DB; simple session tokens in memory) ──
const SESSION_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
const sessions = new Map();

const hashPassword = (password) =>
  crypto.createHash("sha256").update(String(password)).digest("hex");

const createSession = (user) => {
  const token = crypto.randomBytes(32).toString("hex");
  sessions.set(token, {
    userId: user.id,
    username: user.username,
    displayName: user.displayName || user.username,
    expiresAt: Date.now() + SESSION_TTL_MS,
  });
  return token;
};

const getSession = (token) => {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return session;
};

const getBearerToken = (req) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  return header.slice(7);
};

const requireCashierAuth = (req, res, next) => {
  const session = getSession(getBearerToken(req));
  if (!session) {
    return res.status(401).json({ error: "ورود به پنل صندوق الزامی است" });
  }
  req.cashierSession = session;
  return next();
};

app.post("/api/auth/login", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ error: "نام کاربری و رمز عبور الزامی است" });
    }

    const user = await prisma.adminUser.findUnique({
      where: { username: String(username).trim() },
    });

    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "نام کاربری یا رمز عبور اشتباه است" });
    }

    const token = createSession(user);
    res.json({
      token,
      username: user.username,
      displayName: user.displayName || user.username,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در ورود" });
  }
});

app.get("/api/auth/me", (req, res) => {
  const session = getSession(getBearerToken(req));
  if (!session) {
    return res.status(401).json({ error: "نشست منقضی شده است" });
  }
  res.json({
    username: session.username,
    displayName: session.displayName || session.username,
  });
});

app.post("/api/auth/logout", (req, res) => {
  const token = getBearerToken(req);
  if (token) sessions.delete(token);
  res.json({ ok: true });
});

const mapTableStatus = {
  EMPTY: "empty",
  ACTIVE: "active",
  CLEANING: "cleaning",
};

const normalizeImagePath = (req, file, fallbackImage) => {
  if (file) {
    return `${req.protocol}://${req.get("host")}/uploads/${file.filename}`;
  }

  return fallbackImage || null;
};

const toBoolean = (value, defaultVal) => {
  if (value === undefined || value === null) return defaultVal;
  return value === "true" || value === true;
};

const parseJsonField = (value) => {
  if (!value) return null;
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return JSON.stringify(parsed);
  } catch {
    return null;
  }
};

const formatItem = (item) => {
  if (!item) return item;
  return {
    ...item,
    optionGroups: item.optionGroups ? JSON.parse(item.optionGroups) : [],
  };
};

const buildMenuItemPayload = (req) => {
  const body = req.body || {};
  const parsedPrice =
    body.price !== undefined && body.price !== ""
      ? Number(body.price)
      : undefined;
  const parsedDiscount =
    body.discount !== undefined && body.discount !== ""
      ? Number(body.discount)
      : undefined;

  return {
    name: body.nameFA || body.name,
    nameEn: body.nameEn || null,
    price: Number.isNaN(parsedPrice) ? undefined : parsedPrice,
    discount: Number.isNaN(parsedDiscount) ? undefined : parsedDiscount,
    description: body.description || body.desc || null,
    image: normalizeImagePath(req, req.file, body.image),
    category: body.category || body.categoryId || null,
    available: toBoolean(body.available, true),
    suggestion: toBoolean(body.featuredFloravan, false),
    popular: toBoolean(body.featuredPopular, false),
    prepTime: body.prepTime ? Number(body.prepTime) : 20,
    optionGroups: parseJsonField(body.optionGroups),
  };
};

// دریافت همه آیتم‌ها
app.get("/menu-items", async (req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      orderBy: { createdAt: "desc" },
    });

    res.json(items.map(formatItem));
  } catch (error) {
    res.status(500).json({ error: "خطا در دریافت آیتم‌ها" });
  }
});

// افزودن آیتم جدید
app.post("/menu-items", requireCashierAuth, upload.single("image"), async (req, res) => {
  try {
    const payload = buildMenuItemPayload(req);

    if (!payload.name || payload.price === undefined) {
      return res.status(400).json({ error: "نام و قیمت الزامی هستند" });
    }

    if (!req.file && !payload.image) {
      return res.status(400).json({ error: "تصویر محصول الزامی است" });
    }

    const newItem = await prisma.menuItem.create({
      data: payload,
    });

    res.status(201).json(formatItem(newItem));
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" });
    }

    console.error(error);
    res.status(500).json({ error: "خطا در افزودن آیتم" });
  }
});

// ویرایش آیتم
app.put("/menu-items/:id", requireCashierAuth, upload.single("image"), async (req, res) => {
  try {
    const id = Number(req.params.id);

    const payload = buildMenuItemPayload(req);

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) {
        delete payload[key];
      }
    });

    const updatedItem = await prisma.menuItem.update({
      where: { id },
      data: payload,
    });

    res.json(formatItem(updatedItem));
  } catch (error) {
    if (error instanceof multer.MulterError) {
      return res.status(400).json({ error: "حجم فایل نباید بیشتر از ۵ مگابایت باشد" });
    }

    if (error.code === "P2025") {
      return res.status(404).json({ error: "آیتم موردنظر پیدا نشد" });
    }

    console.error(error);
    res.status(500).json({ error: "خطا در ویرایش آیتم" });
  }
});

app.use((error, _req, res, next) => {
  if (!error) {
    return next();
  }

  if (error.message === "فقط فایل تصویری مجاز است") {
    return res.status(400).json({ error: error.message });
  }

  return res.status(500).json({ error: "خطا در آپلود فایل" });
});

// حذف آیتم
app.delete("/menu-items/:id", requireCashierAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.menuItem.delete({ where: { id } });
    res.json({ message: "آیتم حذف شد" });
  } catch (error) {
    res.status(500).json({ error: "خطا در حذف آیتم" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { tableId, items, totalPrice } = req.body;

    if (!tableId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "اطلاعات سفارش ناقص است" });
    }

    const idempotencyKey = resolveIdempotencyKey(req, items);
    if (hasCustomPizza(items) && !idempotencyKey) {
      return sendStructuredError(
        res,
        400,
        "IDEMPOTENCY_KEY_REQUIRED",
        "برای پیتزای سفارشی هدر Idempotency-Key الزامی است"
      );
    }

    if (idempotencyKey) {
      const cached = await getCachedResponse(prisma, idempotencyKey);
      if (cached) {
        return res.status(cached.statusCode || 201).json(cached.body);
      }
    }

    const settings = await prisma.customPizzaSettings.findUnique({
      where: { id: "default" },
    });
    const toppings = await prisma.customPizzaTopping.findMany({
      orderBy: { sortOrder: "asc" },
    });
    const configSettings = settings || {
      basePriceMedium: 550000,
      basePriceFamily: 780000,
      familyToppingMultiplier: 1.3,
      minToppings: 3,
      maxToppings: 7,
    };

    const processedItems = [];
    let serverOrderTotal = 0;

    for (const item of items) {
      if (!isCustomPizzaItem(item)) {
        const line =
          item.lineTotal != null
            ? Number(item.lineTotal)
            : Number(item.price ?? item.unitPrice ?? 0) * (item.qty || 1);
        serverOrderTotal += line;
        processedItems.push(item);
        continue;
      }

      const parsed = parseCustomPizzaItem(item, toppings);
      const validation = validateCustomPizza(parsed, item, configSettings, toppings);

      if (!validation.ok) {
        const status = validation.status || 422;
        return sendStructuredError(res, status, validation.code, validation.error, {
          ...(validation.details || {}),
          ...(validation.serverTotal != null
            ? { serverTotal: validation.serverTotal, breakdown: validation.breakdown }
            : {}),
        });
      }

      const enriched = enrichCustomPizzaItem(item, validation);
      serverOrderTotal += validation.serverTotal;
      processedItems.push(enriched);
    }

    const clientTotal = Number(totalPrice || 0);
    if (clientTotal !== serverOrderTotal) {
      return sendStructuredError(res, 409, "PRICE_CHANGED", "جمع فاکتور با سرور مطابقت ندارد", {
        serverTotal: serverOrderTotal,
        clientTotal,
      });
    }

    let table = await prisma.restaurantTable.findUnique({
      where: { id: Number(tableId) },
    });

    if (!table) {
      table = await prisma.restaurantTable.create({
        data: {
          id: Number(tableId),
          code: `T${tableId}`,
          label: `میز ${tableId}`,
          status: "ACTIVE",
        },
      });
    }

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        items: processedItems,
        totalPrice: serverOrderTotal,
      },
    });

    await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { status: "ACTIVE" },
    });

    const responseBody = {
      success: true,
      orderId: order.id,
    };

    if (idempotencyKey) {
      await storeResponse(prisma, idempotencyKey, 201, {
        statusCode: 201,
        body: responseBody,
      });
    }

    res.status(201).json(responseBody);
  } catch (error) {
    console.error("POST /api/orders", error);
    res.status(500).json({ error: "خطا در ثبت سفارش" });
  }
});

app.get("/api/orders/version", async (_req, res) => {
  const latest = await prisma.order.findFirst({
    orderBy: { updatedAt: "desc" },
    select: { updatedAt: true },
  });

  const unread = await prisma.order.count({
    where: {
      acknowledged: false,
      status: { not: "CLOSED" },
    },
  });

  res.json({
    version: latest?.updatedAt?.getTime() || 0,
    hasUnread: unread > 0,
  });
});

app.get("/api/orders", async (_req, res) => {
  const tables = await prisma.restaurantTable.findMany({
    include: {
      orders: {
        where: { status: { not: "CLOSED" } },
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  const payload = tables.reduce((acc, table) => {
    // Only surface tables that currently have active (non-closed) orders.
    if (table.orders.length === 0) return acc;
    acc[String(table.id)] = {
      status: "active",
      tableId: table.id,
      orders: table.orders.map((order) => ({
        id: String(order.id),
        status: order.status === "PREPARING" ? "confirmed" : "active",
        createdAt: new Date(order.createdAt).getTime(),
        acknowledged: order.acknowledged,
        items: order.items,
      })),
    };

    return acc;
  }, {});

  res.json(payload);
});

// Flat recent order list for the admin "orders" section.
app.get("/api/orders/list", requireCashierAuth, async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { table: true },
    });

    res.json(
      orders.map((o) => ({
        id: String(o.id),
        table: o.table?.id ?? null,
        status:
          o.status === "CLOSED"
            ? "closed"
            : o.acknowledged
            ? "confirmed"
            : "pending",
        total: Number(o.totalPrice) || 0,
        createdAt: new Date(o.createdAt).getTime(),
      }))
    );
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در دریافت سفارش‌ها" });
  }
});

app.patch("/api/orders/:id/ack", requireCashierAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    await prisma.order.update({
      where: { id },
      data: {
        acknowledged: true,
        acknowledgedAt: new Date(),
      },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در تایید سفارش" });
  }
});

// Cashier confirms (accepts) an order.
app.patch("/api/orders/:id/confirm", requireCashierAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.order.update({
      where: { id },
      data: { status: "PREPARING", acknowledged: true, acknowledgedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در تأیید سفارش" });
  }
});

// Cashier rejects an order.
app.patch("/api/orders/:id/reject", requireCashierAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await prisma.order.update({
      where: { id },
      data: { status: "CLOSED", acknowledged: true, acknowledgedAt: new Date() },
    });
    res.json({ ok: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در رد سفارش" });
  }
});

// Cashier closes a table (marks its active orders CLOSED and frees the table).
app.post("/api/orders/close", requireCashierAuth, async (req, res) => {
  try {
    const { tableId, tableKey } = req.body || {};

    let table = null;
    if (tableId != null && !Number.isNaN(Number(tableId))) {
      table = await prisma.restaurantTable.findUnique({
        where: { id: Number(tableId) },
      });
    }
    if (!table && tableKey) {
      table = await prisma.restaurantTable.findUnique({
        where: { code: String(tableKey) },
      });
    }
    if (!table) return res.status(400).json({ error: "میز نامعتبر است" });

    const result = await prisma.order.updateMany({
      where: { tableId: table.id, status: { not: "CLOSED" } },
      data: { status: "CLOSED", acknowledged: true },
    });

    await prisma.restaurantTable.update({
      where: { id: table.id },
      data: { status: "EMPTY" },
    });

    res.json({ ok: true, closed: result.count });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "خطا در بستن میز" });
  }
});

/* ── Custom pizza config ── */
app.get("/api/custom-pizza/options", requireCashierAuth, async (_req, res) => {
  try {
    await ensureCustomPizzaConfig(prisma);
    const settings = await prisma.customPizzaSettings.findUnique({
      where: { id: "default" },
    });
    const toppings = await prisma.customPizzaTopping.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(buildOptionsPayload(settings, toppings));
  } catch (error) {
    console.error("GET /api/custom-pizza/options", error);
    res.status(500).json({ error: "خطا در دریافت گزینه‌های پیتزا سفارشی" });
  }
});

app.get("/api/custom-pizza/config", async (_req, res) => {
  try {
    const config = await ensureCustomPizzaConfig(prisma);
    res.json(config);
  } catch (error) {
    console.error("GET /api/custom-pizza/config", error);
    res.status(500).json({ error: "خطا در دریافت تنظیمات پیتزا سفارشی" });
  }
});

app.put("/api/custom-pizza/config", requireCashierAuth, async (req, res) => {
  try {
    const { settings, toppings } = req.body ?? {};
    if (!settings || !Array.isArray(toppings)) {
      return res.status(400).json({ error: "داده نامعتبر است" });
    }

    const basePriceMedium = Math.max(0, Number(settings.basePriceMedium) || 0);
    const basePriceFamily = Math.max(0, Number(settings.basePriceFamily) || 0);
    const familyToppingMultiplier = Math.max(
      1,
      Math.min(5, Number(settings.familyToppingMultiplier) || 1.3)
    );
    const minToppings = Math.max(1, Math.min(6, Number(settings.minToppings) || 3));
    const maxToppings = Math.max(minToppings, Math.min(10, Number(settings.maxToppings) || 7));

    const updatedSettings = await prisma.customPizzaSettings.upsert({
      where: { id: "default" },
      create: {
        id: "default",
        basePriceMedium,
        basePriceFamily,
        familyToppingMultiplier,
        minToppings,
        maxToppings,
      },
      update: {
        basePriceMedium,
        basePriceFamily,
        familyToppingMultiplier,
        minToppings,
        maxToppings,
      },
    });

    for (let i = 0; i < toppings.length; i++) {
      const t = toppings[i];
      if (!t?.id) continue;
      const groupKey = String(t.group || "vegetable");
      await prisma.customPizzaTopping.upsert({
        where: { id: String(t.id) },
        create: {
          id: String(t.id),
          name: String(t.name ?? t.id),
          emoji: String(t.emoji ?? ""),
          groupKey,
          priceMedium: Math.max(0, Number(t.priceMedium) || 0),
          available: t.available !== false,
          isActive: t.isActive !== false,
          sortOrder: i,
        },
        update: {
          name: String(t.name ?? t.id),
          emoji: String(t.emoji ?? ""),
          groupKey,
          priceMedium: Math.max(0, Number(t.priceMedium) || 0),
          available: t.available !== false,
          isActive: t.isActive !== false,
          sortOrder: i,
        },
      });
    }

    const allToppings = await prisma.customPizzaTopping.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(serializeCustomPizzaConfig(updatedSettings, allToppings));
  } catch (error) {
    console.error("PUT /api/custom-pizza/config", error);
    res.status(500).json({ error: "خطا در ذخیره تنظیمات پیتزا سفارشی" });
  }
});

app.patch("/api/admin/toppings/:id", requireCashierAuth, async (req, res) => {
  try {
    const id = String(req.params.id);
    const body = req.body ?? {};
    const allowed = ["available", "isAvailable", "isActive", "unitPrice", "priceMedium", "sortOrder", "label", "name"];
    const keys = Object.keys(body).filter((k) => allowed.includes(k));
    if (keys.length === 0) {
      return res.status(400).json({ error: "فیلد معتبری ارسال نشده" });
    }

    const existing = await prisma.customPizzaTopping.findUnique({ where: { id } });
    if (!existing) {
      return sendStructuredError(res, 404, "INVALID_TOPPING", "تاپینگ پیدا نشد");
    }

    const data = {};
    if (body.available !== undefined || body.isAvailable !== undefined) {
      data.available = body.available !== false && body.isAvailable !== false;
    }
    if (body.isActive !== undefined) data.isActive = body.isActive !== false;
    if (body.unitPrice !== undefined || body.priceMedium !== undefined) {
      data.priceMedium = Math.max(0, Number(body.unitPrice ?? body.priceMedium) || 0);
    }
    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
    if (body.label !== undefined || body.name !== undefined) {
      data.name = String(body.label ?? body.name);
    }

    const updated = await prisma.customPizzaTopping.update({
      where: { id },
      data,
    });

    res.json({
      code: updated.id,
      label: updated.name,
      category: updated.groupKey,
      unitPrice: updated.priceMedium,
      isActive: updated.isActive,
      isAvailable: updated.available,
      sortOrder: updated.sortOrder,
    });
  } catch (error) {
    console.error("PATCH /api/admin/toppings/:id", error);
    res.status(500).json({ error: "خطا در به‌روزرسانی تاپینگ" });
  }
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
