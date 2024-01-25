import { VideoCard } from "./video-card";
import { loader as IndexLoader } from "~/routes/_index";
import { UseDataFunctionReturn } from "remix-typedjson";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { InfoIcon } from "lucide-react";

export function SignVideoCarousel({
	sign,
	userId,
}: {
	sign: UseDataFunctionReturn<typeof IndexLoader>["signs"][0];
	userId: string | null;
}) {
	return (
		<div className="bg-white rounded-lg">
			<div className="flex justify-between px-1.5 items-center">
				<h2 className="py-3 md:py-6 text-4xl capitalize font-bold">
					{sign.term.word}
				</h2>
				<Popover>
					<PopoverTrigger
						asChild
						aria-label="sign info"
						title="more-info"
						role="application"
					>
						<div className="flex flex-col items-center justify-center p-1.5">
							<InfoIcon role="button" size={24} aria-label="sign info" />
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						{sign?.definition}
						<h4 className="text-xl py-2 font-bold">Example</h4>
						{sign?.example}
					</PopoverContent>
				</Popover>
			</div>
			<swiper-container
				style={{
					"--swiper-navigation-color": "#fff",
					"--swiper-pagination-color": "#000",
				}}
				slides-per-view="1"
				navigation={true}
				pagination={true}
			>
				{sign.videos
					.sort((vA, vB) => (vB.voteCount > vA.voteCount ? 1 : -1))
					.map((video) => (
						<swiper-slide key={video.id}>
							<VideoCard video={video} userId={userId || null} />
						</swiper-slide>
					))}
			</swiper-container>
		</div>
	);
}
