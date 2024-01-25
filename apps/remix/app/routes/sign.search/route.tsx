import { invariant } from "@epic-web/invariant";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "@dactylo/db";
import { signSearch } from "~/utils/sign.server";

export function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("q");
	const limit = url.searchParams.get("limit");
	invariant(query, "query is required");
	const signs = signSearch({
		query,
		limit: limit ? parseInt(limit) : undefined,
	});
	return json({ signs });
}

export async function action({ request }: LoaderFunctionArgs) {
	const formData = await request.formData();
	const q = formData.get("q");
	const signs = await prisma.sign.findMany({
		where: { term: { word: { contains: q as string } } },
		select: { term: true, id: true },
	});
	return json({ signs });
}
