import { prisma } from "~/db.server";

async function seed() {
  console.time("👑 Created roles...");
  await prisma.role.create({
    data: {
      name: "admin",
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: "any" }
        })
      }
    }
  });
  await prisma.role.create({
    data: {
      name: "user",
      permissions: {
        connect: await prisma.permission.findMany({
          select: { id: true },
          where: { access: "own" }
        })
      }
    }
  });
  console.timeEnd("👑 Created roles...");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
