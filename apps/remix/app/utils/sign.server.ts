import { prisma } from "@dactylo/db";

export function signSearch({
  query,
  limit = 10
}: {
  query: string;
  limit?: number;
}) {
  const signs = prisma.sign.findMany({
    where: {
      OR: [{ term: { contains: query } }, { example: { contains: query } }]
    },
    take: limit
  });
  return signs;
}
