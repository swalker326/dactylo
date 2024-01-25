import { prisma } from "@dactylo/db";

export function signSearch({
	query,
	limit = 10,
}: {
	query: string;
	limit?: number;
}) {
	const signs = prisma.sign.findMany({
		where: {
			OR: [
				{ term: { word: { contains: query } } },
				{ example: { contains: query } },
			],
		},
		include: { term: true },
		take: limit,
	});
	return signs;
}
