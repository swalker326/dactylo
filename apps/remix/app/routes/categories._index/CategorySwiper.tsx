import { Link } from "@remix-run/react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { VideoCard } from "~/components/video-card";
import { loader } from "~/routes/categories._index/route";

export function CategorySwiper({
	category,
	userId,
}: {
	category: UseDataFunctionReturn<typeof loader>["categories"][0];
	userId: string | null;
}) {
	return (
		<div className="bg-white py-3 rounded-md">
			<h2 className="px-1.5 text-2xl">{category.name}</h2>
			<swiper-container
				style={{
					"--swiper-navigation-color": "#2463EB",
					"--swiper-pagination-color": "#000",
				}}
				slides-per-view="1"
        autoHeight={true}
				navigation={true}
				pagination={true}
			>
				{category.signs.map((sign) => (
					<swiper-slide key={sign.id}>
						<h3 className="capitalize px-1.5">{sign.term.word}</h3>
						{sign.videos.length === 0 ? (
							<div className="flex items-center justify-center h-full w-full min-h-36">
								<h4>
									No videos for {sign.term.word} 😿{" "}
									<Link
										className="text-blue-500"
										to={`/dashboard/create?signId=${sign.id}`}
									>
										create one!
									</Link>
								</h4>
							</div>
						) : (
							<VideoCard
								key={sign.videos[0].id}
								video={sign.videos[0]}
								userId={userId || null}
							/>
						)}
					</swiper-slide>
				))}
			</swiper-container>
		</div>
	);
}
