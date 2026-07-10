import { prisma } from "../src/db.js";
import { parsePrice } from "../src/utils.js";
import { menuCategories, menuItems } from "../../src/data/menuData.js";
import { TABLE_LAYOUT } from "../../src/data/tableLayout.js";
import { buildInitialTableState } from "../../src/data/sampleCashierData.js";
import {
  getDefaultCustomPizzaSettings,
  getDefaultCustomPizzaToppings,
} from "../src/customPizzaConfig.js";

async function reset() {
  // delete in FK-safe order (cascades cover most, but be explicit)
  await prisma.orderItemOption.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.optionItem.deleteMany();
  await prisma.optionGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.table.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customPizzaTopping.deleteMany();
  await prisma.customPizzaSettings.deleteMany();
}

async function seedCategories() {
  const map = {};
  for (let i = 0; i < menuCategories.length; i++) {
    const cat = menuCategories[i];
    const created = await prisma.category.create({
      data: {
        slug: cat.id,
        name: cat.name,
        icon: cat.icon ?? "",
        sortOrder: i,
        isActive: true,
      },
    });
    map[cat.id] = created.id;
  }
  return map;
}

async function seedMenuItems(categoryMap) {
  let count = 0;
  for (const [slug, category] of Object.entries(menuItems)) {
    const categoryId = categoryMap[slug];
    if (!categoryId) continue;

    const items = category.items ?? [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      await prisma.menuItem.create({
        data: {
          categoryId,
          name: item.nameFA ?? item.name ?? "",
          nameEn: item.name ?? "",
          description: item.desc ?? "",
          imageUrl: item.image ?? "",
          basePrice: item.price ?? "",
          discount: Number(item.discount) || 0,
          prepTime: item.prepTime ?? 20,
          isAvailable: item.available !== false,
          isTrending: Boolean(item.featuredPopular),
          featuredFloravan: Boolean(item.featuredFloravan),
          legacyId: Number(item.id) || null,
          sortOrder: i,
          optionGroups: {
            create: (item.optionGroups ?? []).map((g, gi) => {
              const type = g.type === "multiple" ? "multiple" : "single";
              const choices = g.choices ?? [];
              return {
                title: g.name ?? "",
                type,
                isRequired: Boolean(g.required),
                minSelect: g.required ? 1 : 0,
                maxSelect: type === "multiple" ? Math.max(1, choices.length) : 1,
                sortOrder: gi,
                optionItems: {
                  create: choices.map((c, ci) => ({
                    name: c.label ?? "",
                    priceDelta: c.priceDelta ? String(c.priceDelta) : "",
                    isDefault: ci === 0 && type === "single",
                    sortOrder: ci,
                  })),
                },
              };
            }),
          },
        },
      });
      count++;
    }
  }
  return count;
}

async function seedTables() {
  const map = {};
  for (const t of TABLE_LAYOUT) {
    const created = await prisma.table.create({
      data: {
        name: `میز ${t.id}`,
        code: t.key,
        layoutId: t.id,
        capacity: t.cap ?? 2,
        isActive: true,
      },
    });
    map[t.key] = created.id;
  }
  return map;
}

async function seedSampleOrders(tableMap) {
  const state = buildInitialTableState(TABLE_LAYOUT);
  let count = 0;

  for (const [key, entry] of Object.entries(state)) {
    if (entry.status !== "active" || !entry.orders?.length) continue;
    const tableId = tableMap[key];
    if (!tableId) continue;

    for (const order of entry.orders) {
      const items = order.items ?? [];
      let subtotal = 0;
      const orderItemsCreate = items.map((it) => {
        const qty = Number(it.qty) || 1;
        const line = parsePrice(it.price) * qty;
        subtotal += line;
        return {
          menuItemName: it.name ?? "محصول",
          quantity: qty,
          unitPrice: String(it.price ?? ""),
          totalPrice: String(line),
        };
      });

      await prisma.order.create({
        data: {
          tableId,
          status: "active",
          paymentStatus: "unpaid",
          acknowledged: Boolean(order.acknowledged),
          acknowledgedAt: order.acknowledgedAt ? new Date(order.acknowledgedAt) : null,
          createdAt: order.createdAt ? new Date(order.createdAt) : new Date(),
          subtotal: Math.round(subtotal),
          discountAmount: 0,
          finalAmount: Math.round(subtotal),
          // customerNote intentionally omitted — customer comments are NOT seeded
          orderItems: { create: orderItemsCreate },
        },
      });
      count++;
    }
  }
  return count;
}

async function seedCustomPizza() {
  const settings = getDefaultCustomPizzaSettings();
  await prisma.customPizzaSettings.create({
    data: { id: "default", ...settings },
  });
  const toppings = getDefaultCustomPizzaToppings();
  for (const t of toppings) {
    await prisma.customPizzaTopping.create({ data: t });
  }
  return toppings.length;
}

async function main() {
  console.log("Resetting database...");
  await reset();

  console.log("Seeding categories...");
  const categoryMap = await seedCategories();

  console.log("Seeding menu items...");
  const itemCount = await seedMenuItems(categoryMap);

  console.log("Seeding tables...");
  const tableMap = await seedTables();

  console.log("Seeding sample orders (without customer comments)...");
  const orderCount = await seedSampleOrders(tableMap);

  console.log("Seeding custom pizza config...");
  const toppingCount = await seedCustomPizza();

  console.log(
    `Done: ${Object.keys(categoryMap).length} categories, ${itemCount} items, ${
      Object.keys(tableMap).length
    } tables, ${orderCount} sample orders, ${toppingCount} pizza toppings.`
  );
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
