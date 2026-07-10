import path from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Force an absolute SQLite path so the CLI (relative to schema dir) and the
// runtime client always resolve to the exact same file: server/prisma/dev.db
const dbFile = path.join(__dirname, "..", "prisma", "dev.db");
if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith("file:./")) {
  process.env.DATABASE_URL = `file:${dbFile}`;
}

export const prisma = new PrismaClient();
