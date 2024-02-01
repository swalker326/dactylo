import { prisma } from "@dactylo/db/index";
import { LoaderFunctionArgs } from "@remix-run/node";
import { typedjson, useTypedLoaderData } from "remix-typedjson";

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
		<div>
			<h1>{category.name}</h1>
		</div>
	);
}
