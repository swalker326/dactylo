import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { searchFor } from "~/server/search";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const searchTerm = formData.get("searchTerm");
	console.log(searchTerm);
	if (!searchTerm) {
		return redirect("/search");
	}
	const searchResults = await searchFor(searchTerm as string);
	return searchResults;
}
export default function SearchRoute() {}
