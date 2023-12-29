import { PrismaClient } from "@prisma/client";

import { singleton } from "~/singleton.server";

// Hard-code a unique key, so we can look up the client when this module gets re-imported
const prisma = singleton("prisma", () => new PrismaClient());
prisma.$connect();
const boostedPrisma = new PrismaClient();
await boostedPrisma.$queryRaw`SET @@boost_cached_queries = true`;

export { prisma, boostedPrisma };
