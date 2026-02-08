import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const users = [
    { email: "admin@foms.com", role: "ADMIN" as const },
    { email: "shipper@foms.com", role: "SHIPPER" as const },
    { email: "driver@foms.com", role: "DRIVER" as const },
  ];

  for (const u of users) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { role: u.role, password: passwordHash },
      create: { email: u.email, role: u.role, password: passwordHash },
    });
  }

  console.log("Seeded users:");
  console.log("admin@foms.com / Password123!");
  console.log("shipper@foms.com / Password123!");
  console.log("driver@foms.com / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
