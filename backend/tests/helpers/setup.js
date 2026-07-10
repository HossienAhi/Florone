const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PrismaClient } = require("@prisma/client");

const BACKEND_ROOT = path.join(__dirname, "..", "..");
const TEST_DB_PATH = path.join(BACKEND_ROOT, "prisma", "test-integration.db");
const TEST_DB_URL = `file:${TEST_DB_PATH.replace(/\\/g, "/")}`;

const TEST_ADMIN = {
  username: "test-admin",
  password: "test-password-123",
  displayName: "Test Admin",
};

function hashPassword(password) {
  return crypto.createHash("sha256").update(String(password)).digest("hex");
}

function prepareTestDatabase() {
  process.env.DATABASE_URL = TEST_DB_URL;

  if (fs.existsSync(TEST_DB_PATH)) {
    fs.unlinkSync(TEST_DB_PATH);
  }

  execSync("npx prisma db push --skip-generate --accept-data-loss", {
    cwd: BACKEND_ROOT,
    env: { ...process.env, DATABASE_URL: TEST_DB_URL },
    stdio: "pipe",
  });
}

async function seedTestDatabase(prisma) {
  const { ensureCustomPizzaConfig } = require("../../customPizzaConfig");

  await prisma.adminUser.create({
    data: {
      username: TEST_ADMIN.username,
      displayName: TEST_ADMIN.displayName,
      passwordHash: hashPassword(TEST_ADMIN.password),
    },
  });

  await prisma.menuItem.create({
    data: {
      name: "پیتزا تست",
      price: 350000,
      category: "pizza",
      image: "https://example.com/test-pizza.jpg",
      available: true,
    },
  });

  await ensureCustomPizzaConfig(prisma);
}

let serverInstance = null;
let testPrisma = null;

async function initTestEnvironment() {
  prepareTestDatabase();

  delete require.cache[require.resolve("../../server.js")];
  const { app } = require("../../server.js");

  testPrisma = new PrismaClient();
  await seedTestDatabase(testPrisma);

  return new Promise((resolve) => {
    serverInstance = app.listen(0, "127.0.0.1", () => {
      const { port } = serverInstance.address();
      resolve({
        app,
        baseUrl: `http://127.0.0.1:${port}`,
        prisma: testPrisma,
      });
    });
  });
}

async function stopTestEnvironment() {
  if (serverInstance) {
    await new Promise((resolve) => serverInstance.close(resolve));
    serverInstance = null;
  }

  try {
    const { prisma: serverPrisma } = require("../../server.js");
    if (serverPrisma) {
      await serverPrisma.$disconnect();
    }
  } catch {
    // server module may not be loaded
  }

  if (testPrisma) {
    await testPrisma.$disconnect();
    testPrisma = null;
  }

  delete require.cache[require.resolve("../../server.js")];

  if (fs.existsSync(TEST_DB_PATH)) {
    try {
      fs.unlinkSync(TEST_DB_PATH);
    } catch {
      // Windows may keep SQLite locked briefly after disconnect
    }
  }
}

async function api(baseUrl, routePath, options = {}) {
  const headers = {
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...(options.idempotencyKey ? { "Idempotency-Key": options.idempotencyKey } : {}),
    ...options.headers,
  };

  let body = options.body;
  if (body !== undefined && !(body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(body);
  }

  const res = await fetch(`${baseUrl}${routePath}`, {
    method: options.method || "GET",
    headers,
    body,
  });

  const text = await res.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = text;
  }

  return { status: res.status, json, headers: res.headers };
}

async function loginAsCashier(baseUrl) {
  const res = await api(baseUrl, "/api/auth/login", {
    method: "POST",
    body: { username: TEST_ADMIN.username, password: TEST_ADMIN.password },
  });
  return res.json.token;
}

module.exports = {
  TEST_ADMIN,
  initTestEnvironment,
  stopTestEnvironment,
  api,
  loginAsCashier,
};
