const { IDEMPOTENCY_TTL_MS } = require("./customPizzaConstants");
const { isCustomPizzaItem } = require("./customPizzaOrder");

function extractBuildIds(items) {
  const ids = [];
  for (const item of items || []) {
    if (!isCustomPizzaItem(item)) continue;
    const buildId =
      item.buildId ||
      item.options?.find((o) => o.group === "_build")?.label;
    if (buildId) ids.push(String(buildId));
  }
  return ids.sort();
}

function resolveIdempotencyKey(req, items) {
  const header = req.headers["idempotency-key"] || req.headers["Idempotency-Key"];
  if (header) return String(header).trim();
  const buildIds = extractBuildIds(items);
  if (buildIds.length > 0) return `cp-${buildIds.join("--")}`;
  return null;
}

function hasCustomPizza(items) {
  return (items || []).some(isCustomPizzaItem);
}

async function getCachedResponse(prisma, key) {
  if (!key) return null;
  const row = await prisma.idempotencyRecord.findUnique({ where: { key } });
  if (!row) return null;
  if (row.expiresAt < new Date()) {
    await prisma.idempotencyRecord.delete({ where: { key } }).catch(() => {});
    return null;
  }
  try {
    return JSON.parse(row.responseBody);
  } catch {
    return null;
  }
}

async function storeResponse(prisma, key, statusCode, body) {
  if (!key) return;
  const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);
  await prisma.idempotencyRecord.upsert({
    where: { key },
    create: {
      key,
      statusCode,
      responseBody: JSON.stringify(body),
      expiresAt,
    },
    update: {
      statusCode,
      responseBody: JSON.stringify(body),
      expiresAt,
    },
  });
}

module.exports = {
  resolveIdempotencyKey,
  hasCustomPizza,
  getCachedResponse,
  storeResponse,
  extractBuildIds,
};
