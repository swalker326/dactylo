import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import { VideoCard } from "./video-card";
import { loader as IndexLoader } from "~/routes/_index";
import { UseDataFunctionReturn } from "remix-typedjson";

import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { InfoIcon } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

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
					{sign.term}
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
							{/* <span>info</span> */}
						</div>
					</PopoverTrigger>
					<PopoverContent className="w-80">
						{sign?.definition}
						<h4 className="text-xl py-2 font-bold">Example</h4>
						{sign?.example}
					</PopoverContent>
				</Popover>
			</div>
			<Swiper
				modules={[Navigation, Pagination]}
				effect={"fade"}
				style={{
					// @ts-expect-error - I don't know how to fix this
					"--swiper-navigation-color": "#fff",
					"--swiper-pagination-color": "#000",
				}}
				navigation
				autoHeight
				pagination={{ clickable: true }}
			>
				{sign.videos
					.sort((vA, vB) => (vB.voteCount > vA.voteCount ? 1 : -1))
					.map((video) => (
						<SwiperSlide key={video.id}>
							<VideoCard video={video} userId={userId || null} />
						</SwiperSlide>
					))}
			</Swiper>
		</div>
	);
}
