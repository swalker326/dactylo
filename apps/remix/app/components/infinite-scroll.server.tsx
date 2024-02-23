import { prisma } from "@dactylo/db";

async function fetchSignsForInfiniteScroll({
	cursor,
	pageSize = 10,
}: { cursor?: string; pageSize: number }) {
	const signs = await prisma.sign.findMany({
		where: {
			videos: { some: { status: "ACTIVE" } },
		},
		include: {
			term: true,
			videos: {
				where: { status: "ACTIVE" },
				include: { votes: true, favorites: true },
			},
		},
		take: pageSize + 1, // Fetch one extra record to check if there's a next page
		orderBy: { updatedAt: "desc" },
		cursor: cursor ? { id: cursor } : undefined,
	});

	let nextCursor: string | null = null;

	if (signs.length > pageSize) {
		const nextItem = signs.pop(); // Remove the extra item to maintain pageSize
		nextCursor = nextItem?.id || null;
	}

	return { signs, nextCursor };
}

export { fetchSignsForInfiniteScroll };
