import { LoaderFunctionArgs } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { InfoIcon } from "lucide-react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { VideoCard } from "~/components/video-card";
import { prisma } from "@dactylo/db";
import { requireUserId } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request);
	const videos = await prisma.video.findMany({
		where: { user: { id: userId } },
		include: {
			votes: true,
			favorites: true,
			sign: true,
		},
		take: 20,
	});
	return typedjson({ videos, userId });
}

export default function DashboardIndex() {
	const { videos, userId } = useTypedLoaderData<typeof loader>();

	return (
		<div className="flex flex-col">
			<h2 className="text-4xl pb-3">Your Videos</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				{videos.map((video) => (
					<div key={video.id} className="w-full">
						<div className="w-full" key={video.id}>
							<div className="bg-white dark:bg-gray-700 dark:text-white rounded-lg overflow-hidden">
								<div className="flex items-center justify-between px-1.5">
									<Link to={`/sign/${video.sign.id}`}>
										<h2 className="text-4xl extra-bold py-2 capitalize">
											{video.sign?.term}
										</h2>
									</Link>
									{video.status === "UNDER_REVIEW" ? (
										<span className="text-orange-500 text-xl font-bold">
											Pending
										</span>
									) : video.status === "REMOVED" ? (
										<span className="text-red-500 text-xl font-bold">
											Removed
										</span>
									) : (
										<span className="text-green-500 text-xl font-bold">
											Approved
										</span>
									)}
									<Popover>
										<PopoverTrigger asChild className="m-0">
											<InfoIcon size={24} />
											{/* <Button variant="outline">Open popover</Button> */}
										</PopoverTrigger>
										<PopoverContent className="w-80">
											{video.sign?.definition}
											<h4 className="text-xl py-2 font-bold">Example</h4>
											{video.sign?.example}
										</PopoverContent>
									</Popover>
								</div>
								<div className="bg-white rounded-md">
									<VideoCard
										link={`/video/${video.videoId}`}
										userId={userId || null}
										video={video}
									/>
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
