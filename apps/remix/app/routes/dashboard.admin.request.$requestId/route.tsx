import { prisma } from "@dactylo/db/index";
import { LoaderFunctionArgs, json } from "@remix-run/node";
import { requireUserWithRole } from "~/utils/permissions.server";

export async function loader({ request, params }: LoaderFunctionArgs) {
	const requestId = params.requestId;
	if (!requestId) {
		throw new Error("Request ID is required");
	}
	await requireUserWithRole(request, "admin");
	const requests = await prisma.request.findUnique({
		where: { id: requestId },
	});
	return json({ requests });
}
export default function DashboardAdminRequestRoute() {
	return (
		<div>
			<h1>DashboardAdminRequestRoute</h1>
		</div>
	);
}
