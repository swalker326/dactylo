import { getInstanceInfo, getInternalInstanceDomain } from "litefs-js";

export async function updatePrimaryCacheValue({
	key,
	cacheValue,
}: {
	key: string;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	cacheValue: any;
}) {
	const { currentIsPrimary, primaryInstance } = await getInstanceInfo();
	if (currentIsPrimary) {
		throw new Error(
			`updatePrimaryCacheValue should not be called on the primary instance (${primaryInstance})}`,
		);
	}
	const domain = getInternalInstanceDomain(primaryInstance);
	const token = process.env.INTERNAL_COMMAND_TOKEN;
	return fetch(`${domain}/admin/cache/sqlite`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${token}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ key, cacheValue }),
	});
}
