import { prisma } from "@dactylo/db/index";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { getVideoUrl } from "~/utils/video";

export async function loader({ params }: LoaderFunctionArgs) {
	const slug = params.slug;

	const category = await prisma.category.findUnique({
		where: { slug },
		include: {
			signs: {
				take: 10,
				include: { term: true, videos: { orderBy: { voteCount: "desc" } } },
			},
		},
	});
	if (!category) {
		throw new Error("Category not found");
	}
	return typedjson({ category });
}

export default function CategoriesRoute() {
	const { category } = useTypedLoaderData<typeof loader>();
	return (
		<div className="md:px-1.5">
			<h1 className="px-1 text-2xl text-blue-700 dark:text-blue-500 font-bold">
				{category.name}
			</h1>
			<ul>
				{category.signs.map((sign) => (
					<li key={sign.id} className="bg-white md:rounded-md md:px-1">
						<h2 className=" px-1 text-xl font-thin">{sign.term.word}</h2>
						<ul>
							{sign.videos.map((video) => (
								<video
								  loop
									key={video.id}
									src={getVideoUrl(video.url, "720", "ws")}
									autoPlay
									muted
								>
									<track
										kind="captions"
										src={video.url}
										label="English"
										default
									/>
								</video>
							))}
						</ul>
					</li>
				))}
			</ul>
		</div>
	);
}
