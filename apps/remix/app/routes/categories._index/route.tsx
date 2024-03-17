import { prisma } from "@dactylo/db/index";
import { MetaFunction, useLoaderData } from "@remix-run/react";
import { typedjson, useTypedLoaderData } from "remix-typedjson";
import { CategorySearch } from "~/components/category-search";
import { getVideoUrl } from "~/utils/video";
import { CategorySwiper } from "./CategorySwiper";
import { getUserId } from "~/services/auth.server";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { db } from "@dactylo/drizzle-db";
import { categories as DBcategories } from "@dactylo/drizzle-db/models/categories";

export const meta: MetaFunction = () => {
	return [{ title: "Categories" }];
};

export async function loader({ request }: LoaderFunctionArgs) {
	const maybeUserId = await getUserId(request);
	const categories = await db.query.categories.findMany({
		with: {
			signs: {
				with: {
					sign: {
						with: {
							term: true,
							videos: { with: { votes: true, favorites: true } },
						},
					},
				},
			},
		},
	});

	// const categories = await prisma.category.findMany({
	// 	// where: { signs: { some: {} } },
	// 	include: {
	// 		signs: {
	// 			take: 5,
	// 			include: {
	// 				term: true,
	// 				videos: {
	// 					// where: { status: "ACTIVE" },
	// 					orderBy: { voteCount: "desc" },
	// 					include: { votes: true, favorites: true },
	// 				},
	// 			},
	// 		},
	// 	},
	// 	take: 10,
	// });
	console.log("CATEGORIES", categories);
	return typedjson({ categories, userId: maybeUserId });
}
export default function CategoriesRoute() {
	const { categories, userId } = useTypedLoaderData<typeof loader>();
	return (
		<div>
			<CategorySearch />
			<ul className="flex flex-col gap-3">
				{categories.map((category) => (
					<CategorySwiper
						key={category.id}
						category={category}
						userId={userId}
					/>
					// <li key={name} className="bg-white p-1.5 py-4 pt-2 rounded-md">
					// 	<Link to={`${slug}`}>
					// 		<h4 className="underline text-3xl text-blue-700 dark:text-blue-500 font-bold py-1">
					// 			{name}
					// 		</h4>
					// 	</Link>
					// 	<ul className="flex gap-3 flex-wrap">
					// 		{signs.map((sign) => (
					// 			<li
					// 				className="relative bg-white p-y rounded-md w-full"
					// 				key={sign.id}
					// 			>
					// 				{sign.videos.length > 0 ? (
					// 					<>
					// 						<h5 className="text-2xl top-2 left-2 absolute text-white">
					// 							{sign.term.word}
					// 						</h5>
					// 						<video
					// 							src={getVideoUrl(sign.videos[0].url, "720", "ws")}
					// 							muted
					// 							autoPlay
					// 							loop
					// 							className="w-full rounded-lg"
					// 						/>
					// 					</>
					// 				) : (
					// 					<div className="">
					// 						<h6>
					// 							No videos for {sign.term.word} 😿{" "}
					// 							<Link
					// 								to={`/dashboard/create?signId=${sign.id}`}
					// 								className="text-blue-700 dark:text-blue-500 underline"
					// 							>
					// 								create one!
					// 							</Link>
					// 						</h6>
					// 					</div>
					// 				)}
					// 			</li>
					// 		))}
					// 	</ul>
					// </li>
				))}
			</ul>
		</div>
	);
}
