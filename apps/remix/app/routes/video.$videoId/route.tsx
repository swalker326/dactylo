import { prisma } from "@dactylo/db/index";
import { type LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { typedjson, useTypedLoaderData, redirect } from "remix-typedjson";
import { toast } from "sonner";
import { Button } from "~/components/ui/button";
import { VideoCard } from "~/components/video-card";
import { requireUserId } from "~/services/auth.server";
import { userHasRole } from "~/utils/permissions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const videoId = params.videoId;
	if (!videoId) {
		throw new Error("Video not found");
	}
	const userId = await requireUserId(request);
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { roles: true },
	});
	if (!user) {
		console.log("No User Found");
		return redirect("/");
	}
	const isAdmin = await userHasRole(user, "admin");
	console.log("isAdmin: ", isAdmin);
	const video = await prisma.video.findFirst({
		where: { videoId },
		include: {
			user: true,
			sign: { include: { term: true } },
			votes: true,
			favorites: true,
		},
	});
	if (!video) {
		console.log("No Video Found");
		toast.error("Video not found");
		return redirect("/");
	}
	const usersVideo = video.user.id === userId;
	if (isAdmin || usersVideo) {
		return typedjson({ video, isAdmin });
	}
	return redirect("/");
}
export default function SignVideoRoute() {
	const { video, isAdmin } = useTypedLoaderData<typeof loader>();
	const fetcher = useFetcher();
	return (
		<div>
			<div className="space-y-1 p-1.5 pb-3">
				<h1 className="text-6xl capitalize">{video.sign.term.word}</h1>
				<h2 className="text-body-lg">{video.sign.definition}</h2>
			</div>
			<div className="relative ">
				{video.status === "ACTIVE" ? (
					<div className="px-3 rounded-md bg-blue-500 absolute top-1.5 right 1.5">
						<h1 className="text-3xl font-bold text-white">Active</h1>
					</div>
				) : video.status === "UNDER_REVIEW" ? (
					<div className="px-3 rounded-md bg-orange-500 absolute top-1.5 right-1.5">
						<h1 className="text-3xl font-bold text-white">Under Review</h1>
					</div>
				) : (
					<div className="px-3 rounded-md bg-red-500 absolute top-1.5 right-1.5">
						<h1 className="text-3xl font-bold text-white">Removed</h1>
					</div>
				)}
				<div className="absolute bottom-10 w-full">
					{isAdmin && (
						<div className="flex justify-center">
							<fetcher.Form
								method="POST"
								action="/dashboard/admin"
								className="flex justify-end gap-3 "
							>
								<input type="hidden" name="videoId" value={video.id} />
								<Button
									name="remove"
									value="REMOVE"
									variant="outline"
									className="border border-red-500 text-red-500 hover:bg-red-100 hover:text-red-500"
								>
									{video.status === "ACTIVE" ? "Remove" : "Deny"}
								</Button>
								{video.status === "ACTIVE" ? null : (
									<Button value="APPROVE" name="approved">
										Approve
									</Button>
								)}
							</fetcher.Form>
						</div>
					)}
				</div>
				<VideoCard userId={video.userId} video={video} />
			</div>
		</div>
	);
}
