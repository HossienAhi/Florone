import {
  PIZZA_BUILDER_CONFIG,
  TOPPING_GROUP_LABELS,
  TOPPING_GROUP_ORDER,
} from '../../data/customPizzaData';

const CUSTOM_PIZZA_NAME = 'پیتزای سفارشی';

const META_GROUPS = ['خمیر', 'شکل', 'سایز'];
const TOPPING_GROUP_LABELS_ORDERED = TOPPING_GROUP_ORDER.map((k) => TOPPING_GROUP_LABELS[k]);

export function isCustomPizzaItem(item) {
  if (!item) return false;
  if (item.isCustomPizza) return true;
  if (item.name === CUSTOM_PIZZA_NAME) return true;
  if (item.id === PIZZA_BUILDER_CONFIG.customPizzaId) return true;
  return false;
}

export function getVisibleOptions(item) {
  return (item?.options ?? []).filter((o) => o.group && !o.group.startsWith('_'));
}

export function parseCustomPizzaDetails(item) {
  const opts = getVisibleOptions(item);

  const dough = opts.find((o) => o.group === 'خمیر')?.label ?? null;
  const shape = opts.find((o) => o.group === 'شکل')?.label ?? null;
  const size = opts.find((o) => o.group === 'سایز')?.label ?? null;

  const groups = [];

  for (const groupLabel of TOPPING_GROUP_LABELS_ORDERED) {
    const items = opts.filter((o) => o.group === groupLabel).map((o) => o.label);
    if (items.length > 0) {
      groups.push({ group: groupLabel, items });
    }
  }

  /* سفارش‌های قدیمی با group=تاپینگ */
  const legacy = opts.filter((o) => o.group === 'تاپینگ').map((o) => o.label);
  if (legacy.length > 0) {
    groups.push({ group: 'تاپینگ', items: legacy });
  }

  const known = new Set([...META_GROUPS, ...TOPPING_GROUP_LABELS_ORDERED, 'تاپینگ']);
  const otherOpts = opts.filter((o) => !known.has(o.group));
  if (otherOpts.length > 0) {
    groups.push({
      group: 'سایر',
      items: otherOpts.map((o) => (o.group === o.label ? o.label : `${o.group}: ${o.label}`)),
    });
  }

  const toppings = groups.flatMap((g) => g.items);

  return {
    dough,
    shape,
    size,
    groups,
    toppings,
    toppingCount: toppings.length,
  };
}

export function buildKitchenTicketText(item, { tableId } = {}) {
  const qty = item.qty ?? 1;
  const header = tableId != null ? `میز ${tableId} — ` : '';
  const lines = [`${header}🍕 ${item.name} ×${qty}`, ''];

  if (isCustomPizzaItem(item)) {
    const { dough, shape, size, groups, toppingCount } = parseCustomPizzaDetails(item);

    if (dough) lines.push(`خمیر: ${dough}`);
    if (shape) lines.push(`شکل: ${shape}`);
    if (size) lines.push(`سایز: ${size}`);

    if (groups.length > 0) {
      lines.push('', '—— ترکیب پیتزا ——');
      groups.forEach(({ group, items }) => {
        lines.push(`${group}:`);
        items.forEach((label) => lines.push(`  • ${label}`));
      });
      lines.push('', `جمع المان‌ها: ${toppingCount}`);
    }
  } else {
    const opts = getVisibleOptions(item);
    if (opts.length) {
      lines.push('جزئیات:');
      opts.forEach((o) => lines.push(`  • ${o.group}: ${o.label}`));
    }
  }

  return lines.join('\n').trim();
}
