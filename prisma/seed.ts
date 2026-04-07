import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPass = await bcrypt.hash("admin123", 10);
  const clientPass = await bcrypt.hash("client123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@studio.com" },
    update: {},
    create: { email: "admin@studio.com", name: "Admin", password: adminPass, role: "ADMIN", credits: 0 },
  });

  const client = await prisma.user.upsert({
    where: { email: "client@studio.com" },
    update: {},
    create: { email: "client@studio.com", name: "Client", password: clientPass, role: "CLIENT", credits: 10 },
  });

  const inst = await prisma.instructor.upsert({
    where: { id: "seed-inst-1" },
    update: {},
    create: { id: "seed-inst-1", name: "Sofia", bio: "Certified pilates instructor" },
  });

  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;

  for (let i = 1; i <= 5; i++) {
    await prisma.class.create({
      data: {
        title: `Mat Pilates ${i}`,
        description: "All levels welcome",
        startsAt: new Date(now + i * day),
        durationMin: 60,
        capacity: 8,
        instructorId: inst.id,
      },
    });
  }

  console.log({ admin: admin.email, client: client.email });
}

main().finally(() => prisma.$disconnect());
