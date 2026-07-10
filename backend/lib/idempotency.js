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

const PENDING_STATUS = 102;

async function getCachedResponse(prisma, key) {
  if (!key) return null;
  const row = await prisma.idempotencyRecord.findUnique({ where: { key } });
  if (!row) return null;
  if (row.expiresAt < new Date()) {
    await prisma.idempotencyRecord.delete({ where: { key } }).catch(() => {});
    return null;
  }
  if (row.statusCode === PENDING_STATUS) return null;
  try {
    const parsed = JSON.parse(row.responseBody);
    if (parsed?.pending) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function acquireIdempotencyLock(prisma, key) {
  if (!key) return false;
  try {
    const expiresAt = new Date(Date.now() + IDEMPOTENCY_TTL_MS);
    await prisma.idempotencyRecord.create({
      data: {
        key,
        statusCode: PENDING_STATUS,
        responseBody: JSON.stringify({ pending: true }),
        expiresAt,
      },
    });
    return true;
  } catch (error) {
    if (error.code === "P2002") return false;
    throw error;
  }
}

async function waitForCachedResponse(prisma, key, attempts = 40, delayMs = 25) {
  for (let i = 0; i < attempts; i++) {
    const cached = await getCachedResponse(prisma, key);
    if (cached) return cached;
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

async function releaseIdempotencyLock(prisma, key) {
  if (!key) return;
  await prisma.idempotencyRecord.delete({ where: { key } }).catch(() => {});
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
  acquireIdempotencyLock,
  waitForCachedResponse,
  releaseIdempotencyLock,
  extractBuildIds,
};
