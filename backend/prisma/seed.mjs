import { PrismaClient } from "@prisma/client";
import { menuItems } from "../../florone-app/src/data/menuData.js";

const prisma = new PrismaClient();

// "۶۵۰,۰۰۰" | "650,000" -> 650000
function parsePrice(value) {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "")
    .replace(/[۰-۹]/g, (d) => "۰۱۲۳۴۵۶۷۸۹".indexOf(d))
    .replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d))
    .replace(/[^\d.]/g, "");
  return Number(normalized || 0);
}

async function main() {
  console.log("Clearing existing menu items...");
  await prisma.menuItem.deleteMany();

  let count = 0;
  for (const [slug, category] of Object.entries(menuItems)) {
    const items = category.items ?? [];
    for (const item of items) {
      await prisma.menuItem.create({
        data: {
          name: item.nameFA ?? item.name ?? "",
          nameEn: item.name ?? null,
          price: parsePrice(item.price),
          discount: Number(item.discount) || 0,
          description: item.desc ?? null,
          image: item.image ?? null,
          category: slug,
          available: item.available !== false,
          suggestion: Boolean(item.featuredFloravan),
          popular: Boolean(item.featuredPopular),
          prepTime: item.prepTime ?? 20,
          optionGroups: item.optionGroups
            ? JSON.stringify(item.optionGroups)
            : null,
        },
      });
      count++;
    }
  }

  console.log(`Seeded ${count} menu items across ${Object.keys(menuItems).length} categories.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
