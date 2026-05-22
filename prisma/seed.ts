import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.upsert({
    where: { email: "admin@gmail.com" },
    update: {
      role: "ADMIN",
    },
    create: {
      email: "admin@gmail.com",
      name: "Admin",
      password: "@Barbara1234",
      role: "ADMIN",
    },
  });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });