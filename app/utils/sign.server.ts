import { prisma } from "~/db.server";

export function signSearch({
  query,
  limit = 10
}: {
  query: string;
  limit?: number;
}) {
  const signs = prisma.sign.findMany({
    where: {
      OR: [
        { term: { contains: query, mode: "insensitive" } },
        { example: { contains: query, mode: "insensitive" } }
      ]
    },
    take: limit
  });
  return signs;
}
