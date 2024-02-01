import { prisma } from "@dactylo/db/index";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { requireUserWithRole } from "~/utils/permissions.server";

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserWithRole(request, "admin");
	const requests = await prisma.request.findMany({
		where: { status: "PENDING" },
	});
	return json({ requests });
}
export default function DashboardAdminRequestRoute() {
	const { requests } = useLoaderData<typeof loader>();
	return (
		<div>
			<h1>DashboardAdminRequestRoute</h1>
			<ul>
				{requests.map((request) => (
					<li key={request.id}>{request.term}</li>
				))}
			</ul>
		</div>
	);
}
