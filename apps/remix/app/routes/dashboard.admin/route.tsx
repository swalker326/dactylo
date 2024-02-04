import { prisma } from "@dactylo/db/index";
import { invariant } from "@epic-web/invariant";
import { ActionFunctionArgs } from "@remix-run/node";
import { Outlet } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	console.log("FORM DATA: ");
	for (const [key, value] of formData.entries()) {
		console.log(key, value);
	}
	const { videoId, approve, remove } = Object.fromEntries(formData.entries());
	invariant(videoId, "videoId is required");
	if (videoId && remove === "REMOVED") {
		await prisma.video.update({
			where: { id: videoId as string },
			data: { status: "REMOVED" },
		});
	} else if (videoId && approve === "APPROVED") {
		await prisma.video.update({
			where: { id: videoId as string },
			data: { status: "ACTIVE" },
		});
	}
	return null;
}

export default function DashboardAdminRoute() {
	return <Outlet />;
}
