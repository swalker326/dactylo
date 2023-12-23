import { prisma } from "~/db.server";
import sampleWords from "../app/sampleWords";

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
  // Create sample roles
  console.time("Adding sample words...");
  sampleWords.forEach(async ({ term, definition, example }) => {
    await prisma.sign.create({
      data: {
        term: term,
        definition: definition,
        example: example
      }
    });
  });
  console.timeEnd("Adding sample words...");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
