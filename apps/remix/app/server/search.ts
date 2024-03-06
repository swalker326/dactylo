import { prisma } from "@dactylo/db/index";

export async function searchFor(searchTerm: string) {
	const signs = await prisma.sign.findMany({
		where: {
			term: { word: { contains: searchTerm } },
			videos: { some: { status: "ACTIVE" } },
		},
		include: {
			term: true,
			videos: {
				where: { status: "ACTIVE" },
				include: { votes: true, favorites: true },
			},
		},
	});
	const categories = await prisma.category.findMany({
		where: {
			name: { contains: searchTerm },
		},
	});
  return { signs, categories };
}
