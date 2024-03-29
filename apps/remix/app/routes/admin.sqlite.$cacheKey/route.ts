import { invariantResponse } from "@epic-web/invariant";
import { json, type DataFunctionArgs } from "@remix-run/node";
import { getAllInstances, getInstanceInfo } from "litefs-js";
import { ensureInstance } from "litefs-js/remix";
import { cache } from "~/utils/cache.server";
import { requireUserWithRole } from "~/utils/permissions.server";

export async function loader({ request, params }: DataFunctionArgs) {
	await requireUserWithRole(request, "admin");
	const searchParams = new URL(request.url).searchParams;
	const currentInstanceInfo = await getInstanceInfo();
	const allInstances = await getAllInstances();
	const instance =
		searchParams.get("instance") ?? currentInstanceInfo.currentInstance;
	await ensureInstance(instance);

	const { cacheKey } = params;
	invariantResponse(cacheKey, "cacheKey is required");
	return json({
		instance: {
			hostname: instance,
			region: allInstances[instance],
			isPrimary: currentInstanceInfo.primaryInstance === instance,
		},
		cacheKey,
		value: cache.get(cacheKey),
	});
}
