import { PrismaClient } from "@prisma/client";
import { createHash } from "node:crypto";

const prisma = new PrismaClient();

const USERNAME = "nima-a";
const DISPLAY_NAME = "نیما اسدی";
const PASSWORD = "14052026";

const hashPassword = (password) =>
  createHash("sha256").update(String(password)).digest("hex");

async function main() {
  const user = await prisma.adminUser.upsert({
    where: { username: USERNAME },
    update: { passwordHash: hashPassword(PASSWORD), displayName: DISPLAY_NAME },
    create: {
      username: USERNAME,
      displayName: DISPLAY_NAME,
      passwordHash: hashPassword(PASSWORD),
    },
  });

  console.log(`Admin user ready: ${user.username} (id: ${user.id})`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
