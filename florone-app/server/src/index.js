import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import express from "express";
import cors from "cors";
import multer from "multer";
import { prisma } from "./db.js";
import { parsePrice, toPriceLabel, toBool, toInt } from "./utils.js";
import { ensureCustomPizzaConfig, serializeCustomPizzaConfig } from "./customPizzaConfig.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT) || 5000;
const PUBLIC_BASE = `http://localhost:${PORT}`;

const UPLOAD_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use("/uploads", express.static(UPLOAD_DIR));

/* ── image upload (accept any field, pick the "image" file) ── */
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname) || ".jpg";
    cb(null, `item-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

/* ── in-memory version signal for cashier polling ── */
let orderVersion = Date.now();
const bumpVersion = () => {
  orderVersion = Date.now();
};

/* ── serializers ── */
function serializeMenuItem(item) {
  return {
    id: item.id,
    category: item.category?.slug ?? null,
    categoryId: item.category?.slug ?? null,
    name: item.name, // Persian (nameFA)
    nameEn: item.nameEn,
    price: item.basePrice,
    discount: item.discount,
    description: item.description,
    image: item.imageUrl,
    available: item.isAvailable,
    suggestion: item.featuredFloravan,
    popular: item.isTrending,
    prepTime: item.prepTime,
    optionGroups: (item.optionGroups ?? []).map((g) => ({
      id: g.id,
      name: g.title,
      type: g.type,
      required: g.isRequired,
      choices: (g.optionItems ?? []).map((c) => ({
        id: c.id,
        label: c.name,
        priceDelta: c.priceDelta,
      })),
    })),
  };
}

const menuInclude = {
  category: true,
  optionGroups: {
    orderBy: { sortOrder: "asc" },
    include: { optionItems: { orderBy: { sortOrder: "asc" } } },
  },
};

// Build the option-group nested-create payload from an incoming array.
function buildOptionGroupsCreate(optionGroups) {
  if (!Array.isArray(optionGroups)) return [];
  return optionGroups
    .filter((g) => g && (g.name || g.title))
    .map((g, gi) => {
      const type = g.type === "multiple" ? "multiple" : "single";
      const choices = Array.isArray(g.choices) ? g.choices : [];
      return {
        title: String(g.name ?? g.title ?? "").trim(),
        type,
        isRequired: toBool(g.required),
        minSelect: toBool(g.required) ? 1 : 0,
        maxSelect: type === "multiple" ? Math.max(1, choices.length) : 1,
        sortOrder: gi,
        optionItems: {
          create: choices
            .filter((c) => c && (c.label ?? c.name))
            .map((c, ci) => ({
              name: String(c.label ?? c.name ?? "").trim(),
              priceDelta: c.priceDelta ? String(c.priceDelta) : "",
              isDefault: ci === 0 && type === "single",
              sortOrder: ci,
            })),
        },
      };
    });
}

// Parse the multipart body of a menu-item create/update request.
function parseMenuBody(req) {
  const body = req.body ?? {};
  let optionGroups = [];
  if (body.optionGroups) {
    try {
      optionGroups =
        typeof body.optionGroups === "string"
          ? JSON.parse(body.optionGroups)
          : body.optionGroups;
    } catch {
      optionGroups = [];
    }
  }

  const file = (req.files ?? []).find((f) => f.fieldname === "image");
  const imageFromFile = file ? `${PUBLIC_BASE}/uploads/${file.filename}` : null;

  return {
    slug: body.category || body.categoryId || null,
    // form sends Persian in `nameFA` and English in `name`
    name: (body.nameFA ?? body.name ?? "").trim(),
    nameEn: (body.nameEn ?? body.name ?? "").trim(),
    price: toPriceLabel(body.price),
    discount: toInt(body.discount, 0),
    description: (body.desc ?? body.description ?? "").trim(),
    prepTime: toInt(body.prepTime, 20),
    available: toBool(body.available, true),
    featuredFloravan: toBool(body.featuredFloravan, false),
    isTrending: toBool(body.featuredPopular ?? body.popular, false),
    image: imageFromFile ?? (body.image || ""),
    optionGroups,
  };
}

/* ══════════════════ HEALTH ══════════════════ */
app.get("/api/health", (_req, res) => res.json({ ok: true }));

/* ══════════════════ CATEGORIES ══════════════════ */
app.get("/api/categories", async (_req, res) => {
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: "asc" } });
  res.json(cats);
});

/* ══════════════════ MENU ITEMS (CRUD) ══════════════════ */
app.get("/menu-items", async (_req, res) => {
  try {
    const items = await prisma.menuItem.findMany({
      include: menuInclude,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    res.json(items.map(serializeMenuItem));
  } catch (err) {
    console.error("GET /menu-items", err);
    res.status(500).json({ error: "خطا در دریافت منو" });
  }
});

app.post("/menu-items", upload.any(), async (req, res) => {
  try {
    const data = parseMenuBody(req);
    if (!data.name) return res.status(400).json({ error: "نام محصول الزامی است" });
    if (!data.slug) return res.status(400).json({ error: "دسته‌بندی نامعتبر است" });

    const category = await prisma.category.findUnique({ where: { slug: data.slug } });
    if (!category) return res.status(400).json({ error: "دسته‌بندی پیدا نشد" });

    const created = await prisma.menuItem.create({
      data: {
        categoryId: category.id,
        name: data.name,
        nameEn: data.nameEn,
        description: data.description,
        imageUrl: data.image,
        basePrice: data.price,
        discount: data.discount,
        prepTime: data.prepTime,
        isAvailable: data.available,
        isTrending: data.isTrending,
        featuredFloravan: data.featuredFloravan,
        optionGroups: { create: buildOptionGroupsCreate(data.optionGroups) },
      },
      include: menuInclude,
    });

    res.status(201).json(serializeMenuItem(created));
  } catch (err) {
    console.error("POST /menu-items", err);
    res.status(500).json({ error: "خطا در افزودن محصول" });
  }
});

app.put("/menu-items/:id", upload.any(), async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });

    const data = parseMenuBody(req);
    const category = data.slug
      ? await prisma.category.findUnique({ where: { slug: data.slug } })
      : null;

    // Replace option groups wholesale to keep them in sync with the editor.
    await prisma.optionGroup.deleteMany({ where: { menuItemId: id } });

    const updated = await prisma.menuItem.update({
      where: { id },
      data: {
        categoryId: category ? category.id : existing.categoryId,
        name: data.name || existing.name,
        nameEn: data.nameEn,
        description: data.description,
        imageUrl: data.image || existing.imageUrl,
        basePrice: data.price || existing.basePrice,
        discount: data.discount,
        prepTime: data.prepTime,
        isAvailable: data.available,
        isTrending: data.isTrending,
        featuredFloravan: data.featuredFloravan,
        optionGroups: { create: buildOptionGroupsCreate(data.optionGroups) },
      },
      include: menuInclude,
    });

    res.json(serializeMenuItem(updated));
  } catch (err) {
    console.error("PUT /menu-items/:id", err);
    res.status(500).json({ error: "خطا در ویرایش محصول" });
  }
});

app.delete("/menu-items/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.menuItem.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "محصول پیدا نشد" });
    await prisma.menuItem.delete({ where: { id } });
    res.json({ ok: true, id });
  } catch (err) {
    console.error("DELETE /menu-items/:id", err);
    res.status(500).json({ error: "خطا در حذف محصول" });
  }
});

/* ══════════════════ ORDERS ══════════════════ */

// Cashier dashboard: object keyed by table.code -> { status, orders[] }
app.get("/api/orders", async (_req, res) => {
  try {
    const tables = await prisma.table.findMany({
      include: {
        orders: {
          where: { status: { in: ["active", "confirmed"] } },
          orderBy: { createdAt: "asc" },
          include: {
            orderItems: {
              include: { orderItemOptions: true },
            },
          },
        },
      },
    });

    const result = {};
    for (const t of tables) {
      if (t.orders.length === 0) continue;
      result[t.code] = {
        status: "active",
        orders: t.orders.map((o) => ({
          id: o.id,
          status: o.status,
          createdAt: new Date(o.createdAt).getTime(),
          acknowledged: o.acknowledged,
          acknowledgedAt: o.acknowledgedAt
            ? new Date(o.acknowledgedAt).getTime()
            : undefined,
          items: o.orderItems.map((oi) => {
            const options = (oi.orderItemOptions ?? []).map((op) => ({
              group: op.optionGroupTitle,
              label: op.optionItemName,
            }));
            const isCustomPizza = oi.menuItemName === "پیتزای سفارشی";
            return {
              name: oi.menuItemName,
              qty: oi.quantity,
              price: toPriceLabel(oi.unitPrice),
              lineTotal: toPriceLabel(oi.totalPrice),
              options,
              isCustomPizza,
            };
          }),
        })),
      };
    }
    res.json(result);
  } catch (err) {
    console.error("GET /api/orders", err);
    res.status(500).json({ error: "خطا در دریافت سفارش‌ها" });
  }
});

// Polling signal for the cashier: version + whether an unread order exists.
app.get("/api/orders/version", async (_req, res) => {
  try {
    const unread = await prisma.order.count({
      where: { status: { in: ["active", "confirmed"] }, acknowledged: false },
    });
    res.json({ version: orderVersion, hasUnread: unread > 0 });
  } catch (err) {
    console.error("GET /api/orders/version", err);
    res.status(500).json({ error: "خطا" });
  }
});

// Flat recent order list for the admin "orders" section.
app.get("/api/orders/list", async (_req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 40,
      include: { table: true },
    });
    res.json(
      orders.map((o) => ({
        id: o.id,
        table: o.table?.layoutId ?? null,
        status: o.status === "closed" ? "closed" : o.acknowledged ? "confirmed" : "pending",
        total: toPriceLabel(o.finalAmount),
        createdAt: new Date(o.createdAt).getTime(),
      }))
    );
  } catch (err) {
    console.error("GET /api/orders/list", err);
    res.status(500).json({ error: "خطا در دریافت سفارش‌ها" });
  }
});

// Customer places an order.
app.post("/api/orders", async (req, res) => {
  try {
    const { tableId, tableKey, items, totalPrice, customerNote } = req.body ?? {};

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "فاکتور خالی است" });
    }

    const table = await prisma.table.findFirst({
      where: {
        OR: [
          tableKey ? { code: String(tableKey) } : undefined,
          tableId != null ? { layoutId: Number(tableId) } : undefined,
        ].filter(Boolean),
      },
    });
    if (!table) return res.status(400).json({ error: "میز نامعتبر است" });

    let subtotal = 0;
    const orderItemsCreate = [];
    for (const it of items) {
      const qty = Number(it.qty) || 1;
      const unit = parsePrice(it.price);
      const lineOptionsDelta = 0; // deltas are already baked into unit price on the client
      const line = (unit + lineOptionsDelta) * qty;
      subtotal += line;

      const menuItem =
        it.id != null
          ? await prisma.menuItem.findUnique({ where: { id: String(it.id) } })
          : null;

      orderItemsCreate.push({
        menuItemId: menuItem ? menuItem.id : null,
        menuItemName: it.name ?? menuItem?.name ?? "محصول",
        quantity: qty,
        unitPrice: toPriceLabel(it.price),
        totalPrice: toPriceLabel(line),
        orderItemOptions: {
          create: (Array.isArray(it.options) ? it.options : []).map((op) => ({
            optionGroupTitle: op.group ?? "",
            optionItemName: op.label ?? "",
            priceDelta: op.priceDelta ? String(op.priceDelta) : "",
          })),
        },
      });
    }

    const finalAmount = totalPrice != null ? parsePrice(totalPrice) : subtotal;
    const discountAmount = Math.max(0, subtotal - finalAmount);

    const order = await prisma.order.create({
      data: {
        tableId: table.id,
        status: "active",
        paymentStatus: "unpaid",
        acknowledged: false,
        subtotal: Math.round(subtotal),
        discountAmount: Math.round(discountAmount),
        finalAmount: Math.round(finalAmount),
        // customerNote intentionally supported but not required
        customerNote: customerNote ? String(customerNote) : null,
        orderItems: { create: orderItemsCreate },
      },
    });

    bumpVersion();
    res.status(201).json({ ok: true, orderId: order.id, tableCode: table.code });
  } catch (err) {
    console.error("POST /api/orders", err);
    res.status(500).json({ error: "ثبت سفارش انجام نشد" });
  }
});

// Cashier acknowledges an order.
app.patch("/api/orders/:id/ack", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد" });

    const updated = await prisma.order.update({
      where: { id },
      data: { acknowledged: true, acknowledgedAt: new Date() },
    });
    bumpVersion();
    res.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("PATCH /api/orders/:id/ack", err);
    res.status(500).json({ error: "خطا در تأیید سفارش" });
  }
});

// Cashier confirms (accepts) an order.
app.patch("/api/orders/:id/confirm", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد" });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "confirmed",
        acknowledged: true,
        acknowledgedAt: existing.acknowledgedAt ?? new Date(),
      },
    });
    bumpVersion();
    res.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("PATCH /api/orders/:id/confirm", err);
    res.status(500).json({ error: "خطا در تأیید سفارش" });
  }
});

// Cashier rejects an order (e.g. an invalid external order).
app.patch("/api/orders/:id/reject", async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: "سفارش پیدا نشد" });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: "cancelled",
        acknowledged: true,
        acknowledgedAt: existing.acknowledgedAt ?? new Date(),
        closedAt: new Date(),
      },
    });
    bumpVersion();
    res.json({ ok: true, id: updated.id });
  } catch (err) {
    console.error("PATCH /api/orders/:id/reject", err);
    res.status(500).json({ error: "خطا در رد سفارش" });
  }
});

// Cashier closes a table (marks all its active orders as closed/paid).
app.post("/api/orders/close", async (req, res) => {
  try {
    const { tableKey, tableId } = req.body ?? {};
    const table = await prisma.table.findFirst({
      where: {
        OR: [
          tableKey ? { code: String(tableKey) } : undefined,
          tableId != null ? { layoutId: Number(tableId) } : undefined,
        ].filter(Boolean),
      },
    });
    if (!table) return res.status(400).json({ error: "میز نامعتبر است" });

    const now = new Date();
    const result = await prisma.order.updateMany({
      where: { tableId: table.id, status: { in: ["active", "confirmed"] } },
      data: { status: "closed", paymentStatus: "paid", closedAt: now, paidAt: now },
    });
    bumpVersion();
    res.json({ ok: true, closed: result.count });
  } catch (err) {
    console.error("POST /api/orders/close", err);
    res.status(500).json({ error: "خطا در بستن میز" });
  }
});

/* ══════════════════ CUSTOM PIZZA CONFIG ══════════════════ */

app.get("/api/custom-pizza/config", async (_req, res) => {
  try {
    const config = await ensureCustomPizzaConfig(prisma);
    res.json(config);
  } catch (err) {
    console.error("GET /api/custom-pizza/config", err);
    res.status(500).json({ error: "خطا در دریافت تنظیمات پیتزا سفارشی" });
  }
});

app.put("/api/custom-pizza/config", async (req, res) => {
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
    const maxToppings = Math.max(minToppings, Math.min(10, Number(settings.maxToppings) || 6));

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
      await prisma.customPizzaTopping.upsert({
        where: { id: String(t.id) },
        create: {
          id: String(t.id),
          name: String(t.name ?? t.id),
          emoji: String(t.emoji ?? ""),
          groupKey: String(t.group || "vegetable"),
          priceMedium: Math.max(0, Number(t.priceMedium) || 0),
          available: t.available !== false,
          sortOrder: i,
        },
        update: {
          name: String(t.name ?? t.id),
          emoji: String(t.emoji ?? ""),
          groupKey: String(t.group || "vegetable"),
          priceMedium: Math.max(0, Number(t.priceMedium) || 0),
          available: t.available !== false,
          sortOrder: i,
        },
      });
    }

    const allToppings = await prisma.customPizzaTopping.findMany({
      orderBy: { sortOrder: "asc" },
    });
    res.json(serializeCustomPizzaConfig(updatedSettings, allToppings));
  } catch (err) {
    console.error("PUT /api/custom-pizza/config", err);
    res.status(500).json({ error: "خطا در ذخیره تنظیمات پیتزا سفارشی" });
  }
});

app.listen(PORT, () => {
  console.log(`Florone API running on ${PUBLIC_BASE}`);
});
