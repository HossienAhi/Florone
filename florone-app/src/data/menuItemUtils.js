// v2: v1 could contain duplicated items caused by seed/backend id collisions.
const STORAGE_KEY = "floravan-menu-v2";

export function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function createEmptyOptionChoice() {
  return { id: createId("choice"), label: "", priceDelta: "" };
}

export function createEmptyOptionGroup() {
  return {
    id: createId("group"),
    name: "",
    required: false,
    type: "single",
    choices: [createEmptyOptionChoice()],
  };
}

export function createEmptyMenuItem(categoryId) {
  const nextId = Date.now() % 100000;
  return {
    id: nextId,
    categoryId,
    name: "",
    nameFA: "",
    nameEn: "",
    price: "",
    discount: 0,
    desc: "",
    image: "/src/assets/pictures/salad.jpg",
    prepTime: 20,
    available: true,
    featuredFloravan: false,
    featuredPopular: false,
    optionGroups: [],
  };
}

export function normalizeMenuItem(item, categoryId) {
  return {
    id: item.id,
    categoryId: item.categoryId ?? categoryId,
    name: item.name ?? "",
    nameFA: item.nameFA ?? "",
    nameEn: item.nameEn ?? "",
    // بک‌اند قیمت را به صورت عدد برمی‌گرداند؛ همه‌جا به رشته تبدیل می‌کنیم
    price: item.price != null ? String(item.price) : "",
    discount: Number(item.discount) || 0,
    desc: item.desc ?? "",
    image: item.image ?? "/src/assets/pictures/salad.jpg",
    prepTime: item.prepTime ?? 20,
    available: item.available !== false,
    featuredFloravan: Boolean(item.featuredFloravan),
    featuredPopular: Boolean(item.featuredPopular),
    optionGroups: Array.isArray(item.optionGroups)
      ? item.optionGroups.map((group) => ({
          id: group.id ?? createId("group"),
          name: group.name ?? "",
          required: Boolean(group.required),
          type: group.type === "multiple" ? "multiple" : "single",
          choices: Array.isArray(group.choices) && group.choices.length > 0
            ? group.choices.map((choice) => ({
                id: choice.id ?? createId("choice"),
                label: choice.label != null ? String(choice.label) : "",
                priceDelta: choice.priceDelta != null ? String(choice.priceDelta) : "",
              }))
            : [createEmptyOptionChoice()],
        }))
      : [],
  };
}

// Remove items that share the same id inside a category (last one wins).
export function dedupeById(items) {
  const map = new Map();
  items.forEach((item) => {
    map.set(String(item.id), item);
  });
  return Array.from(map.values());
}

export function normalizeMenuItems(seedItems) {
  const normalized = {};

  Object.entries(seedItems).forEach(([categoryId, category]) => {
    normalized[categoryId] = {
      title: category.title,
      items: dedupeById(
        category.items.map((item) => normalizeMenuItem(item, categoryId))
      ),
    };
  });

  return normalized;
}

// Convert a raw API/DB menu item (server field names) into the normalized
// shape used throughout the app. The server keeps price as a number and uses
// different field names (suggestion/popular/description/nameEn).
const FALLBACK_IMAGE = "/src/assets/pictures/salad.jpg";

export function mapApiItem(item, categoryId) {
  const resolvedCategory = item.category ?? item.categoryId ?? categoryId;
  return normalizeMenuItem(
    {
      id: item.id,
      name: item.nameEn || item.name,
      nameFA: item.name,
      nameEn: item.nameEn || "",
      price: item.price,
      discount: item.discount,
      desc: item.description ?? item.desc,
      image: item.image || FALLBACK_IMAGE,
      available: item.available,
      featuredFloravan: item.suggestion,
      featuredPopular: item.popular,
      prepTime: item.prepTime ?? 20,
      optionGroups: item.optionGroups || [],
    },
    resolvedCategory
  );
}

// Build a full menu object from a flat list of API items. The database is the
// source of truth: every category present in the response fully replaces the
// seeded items so server ids never collide with the seed. Categories with no
// rows in the database keep their seed items.
export function buildMenuFromApiItems(items, seedItems) {
  const nextMenu = normalizeMenuItems(seedItems);

  if (!Array.isArray(items) || items.length === 0) {
    return nextMenu;
  }

  const byCategory = {};

  items.forEach((item) => {
    const categoryId = item.category ?? item.categoryId;
    if (!categoryId || !nextMenu[categoryId]) {
      return;
    }
    (byCategory[categoryId] ||= []).push(mapApiItem(item, categoryId));
  });

  Object.entries(byCategory).forEach(([categoryId, categoryItems]) => {
    nextMenu[categoryId] = {
      ...nextMenu[categoryId],
      items: dedupeById(categoryItems),
    };
  });

  return nextMenu;
}

export function loadMenuFromStorage(seedItems) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeMenuItems(seedItems);
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return normalizeMenuItems(seedItems);
    }
    // دسته‌های تازه‌ای که به seed اضافه شده‌اند ولی هنوز در storage نیستند،
    // حفظ شوند و عنوان دسته‌ها همیشه از seed خوانده شود (فقط آیتم‌ها از storage).
    const merged = { ...seedItems };
    Object.entries(parsed).forEach(([categoryId, category]) => {
      merged[categoryId] = {
        ...category,
        title: seedItems[categoryId]?.title ?? category.title,
      };
    });
    return normalizeMenuItems(merged);
  } catch {
    return normalizeMenuItems(seedItems);
  }
}

export function saveMenuToStorage(menuItems) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(menuItems));
}

export function getNextItemId(items) {
  const max = items.reduce((acc, item) => Math.max(acc, Number(item.id) || 0), 0);
  return max + 1;
}

export function countMenuStats(menuItems) {
  let active = 0;
  let inactive = 0;

  Object.values(menuItems).forEach((category) => {
    category.items.forEach((item) => {
      if (item.available) active += 1;
      else inactive += 1;
    });
  });

  return { active, inactive };
}

export function getAllMenuItems(menuItems) {
  return Object.entries(menuItems).flatMap(([categoryId, category]) =>
    category.items.map((item) => ({ ...item, categoryId, categoryTitle: category.title }))
  );
}

export function getFloravanSpecials(menuItems) {
  return getAllMenuItems(menuItems).filter(
    (item) => item.available && item.featuredFloravan
  );
}

export function getPopularItems(menuItems) {
  return getAllMenuItems(menuItems).filter(
    (item) => item.available && item.featuredPopular
  );
}

export function getDiscountedItems(menuItems) {
  return getAllMenuItems(menuItems).filter(
    (item) => item.available && Number(item.discount) > 0
  );
}

export { STORAGE_KEY };
