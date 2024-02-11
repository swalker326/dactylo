import { Link } from "@remix-run/react";
import { UseDataFunctionReturn } from "remix-typedjson";
import { VideoCard } from "~/components/video-card";
import { loader } from "~/routes/categories._index/route";
import "./style.css";

export function CategorySwiper({
	category,
	userId,
}: {
	category: UseDataFunctionReturn<typeof loader>["categories"][0];
	userId: string | null;
}) {
	return (
		<div className="bg-white py-3 rounded-md">
			<Link
				to={`${category.slug}`}
				className="px-1.5 text-3xl text-blue-700 dark:text-blue-500 font-bold"
			>
				{category.name}
			</Link>
			<swiper-container
				style={{
					"--swiper-navigation-color": "#2463EB",
					"--swiper-pagination-color": "#000",
				}}
				slides-per-view="1"
				navigation={true}
				pagination={true}
			>
				{category.signs.map((sign) => (
					<swiper-slide key={sign.id}>
						{sign.videos.length === 0 ? (
							<h4>
								No videos for {sign.term.word} 😿{" "}
								<Link
									className="text-blue-500"
									to={`/dashboard/create?signId=${sign.id}`}
								>
									create one!
								</Link>
							</h4>
							// <div className="flex justify-center h-full border border-green-500">
							// </div>
						) : (
							<>
								<h3 className="capitalize px-1.5">{sign.term.word}</h3>
								<VideoCard
									key={sign.videos[0].id}
									video={sign.videos[0]}
									userId={userId || null}
								/>
							</>
						)}
					</swiper-slide>
				))}
			</swiper-container>
		</div>
	);
}
