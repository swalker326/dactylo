import { invariant } from "@epic-web/invariant";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { prisma } from "@dactylo/db";
import { requireUserId } from "~/services/auth.server";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const videoId = formData.get("videoId");
	const userId = await requireUserId(request);
	const video = await prisma.video.findUnique({
		where: { id: videoId as string },
		include: { favorites: true },
	});
	invariant(video, "No video found");
	invariant(userId, "No user selected");
	const favoriteExists = video.favorites.find(
		(favorite) => favorite.userId === userId,
	);
	if (favoriteExists) {
		await prisma.favorite.delete({
			where: { id: favoriteExists.id },
		});
		return json({ favorite: null }, { status: 200 });
	} else {
		const favorite = await prisma.favorite.create({
			data: {
				video: { connect: { id: videoId as string } },
				user: { connect: { id: userId as string } },
			},
		});
		return json({ favorite }, { status: 201 });
	}
}
