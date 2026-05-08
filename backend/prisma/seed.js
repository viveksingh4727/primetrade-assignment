import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/prisma/client.ts";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const userPassword = await bcrypt.hash("User@123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@primetrade.ai" },
    update: {},
    create: { email: "admin@primetrade.ai", name: "Admin User", password: adminPassword, role: "ADMIN" },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@primetrade.ai" },
    update: {},
    create: { email: "user@primetrade.ai", name: "Test User", password: userPassword, role: "USER" },
  });

  await prisma.task.createMany({
    data: [
      { title: "Set up CI/CD pipeline", description: "Configure GitHub Actions", status: "IN_PROGRESS", priority: "HIGH", userId: user.id },
      { title: "Write API documentation", description: "Document all REST endpoints using Swagger", status: "COMPLETED", priority: "MEDIUM", userId: user.id },
      { title: "Implement Redis caching", description: "Add Redis caching layer for frequent queries", status: "PENDING", priority: "LOW", userId: user.id },
    ],
    skipDuplicates: true,
  });

  console.log("Seed complete");
  console.log("Admin:", admin.email, "/ Password: Admin@123");
  console.log("User: ", user.email, "/ Password: User@123");
}

main().catch(console.error).finally(() => prisma.$disconnect());
