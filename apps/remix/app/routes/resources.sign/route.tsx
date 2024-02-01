import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "@dactylo/db";
import { signSearch } from "~/utils/sign.server";

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url);
	const query = url.searchParams.get("query");
	const signId = url.searchParams.get("id");
	const limit = url.searchParams.get("limit");
	if (signId) {
		return json({
			signs: await prisma.sign.findMany({
				where: { id: signId },
				select: { term: true, id: true },
			}),
		});
	}
	return json({
		signs: await signSearch({
			query: query ?? "",
			limit: limit ? parseInt(limit) : undefined,
		}),
	});
}
export async function action({ request }: LoaderFunctionArgs) {
	const formData = await request.formData();
	const q = formData.get("q");
	const signs = await prisma.sign.findMany({
		where: { term: { word: { contains: q as string } } },
		select: { term: true, id: true },
	});
	return { signs };
}
