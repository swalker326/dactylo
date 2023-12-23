import { LoaderFunctionArgs, json } from "@remix-run/node";
import { prisma } from "~/db.server";
import { signSearch } from "~/utils/sign.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const url = new URL(request.url);
  const query = url.searchParams.get("query");
  const limit = url.searchParams.get("limit");
  return json({
    signs: await signSearch({
      query: query ?? "",
      limit: limit ? parseInt(limit) : undefined
    })
  });
}
export async function action({ request }: LoaderFunctionArgs) {
  const formData = await request.formData();
  const q = formData.get("q");
  const signs = await prisma.sign.findMany({
    where: { term: { contains: q as string } },
    select: { term: true, id: true }
  });
  return { signs };
}
