import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";
import { extendedTheme } from "./extended-theme";

/**
 * Combine multiple header objects into one (uses append so headers are not overridden)
 */
export function combineHeaders(
	...headers: Array<ResponseInit["headers"] | null | undefined>
) {
	const combined = new Headers();
	for (const header of headers) {
		if (!header) continue;
		for (const [key, value] of new Headers(header).entries()) {
			combined.append(key, value);
		}
	}
	return combined;
}

export function getDomainUrl(request: Request) {
	const host =
		request.headers.get("X-Forwarded-Host") ??
		request.headers.get("host") ??
		new URL(request.url).host;
	const protocol = host.includes("localhost") ? "http" : "https";
	return `${protocol}://${host}`;
}

export function getReferrerRoute(request: Request) {
	// spelling errors and whatever makes this annoyingly inconsistent
	// in my own testing, `referer` returned the right value, but 🤷‍♂️
	const referrer =
		request.headers.get("referer") ??
		request.headers.get("referrer") ??
		request.referrer;
	const domain = getDomainUrl(request);
	if (referrer?.startsWith(domain)) {
		return referrer.slice(domain.length);
	} else {
		return "/";
	}
}

function formatColors() {
	const colors = [];
	for (const [key, color] of Object.entries(extendedTheme.colors)) {
		if (typeof color === "string") {
			colors.push(key);
		} else {
			const colorGroup = Object.keys(color).map((subKey) =>
				subKey === "DEFAULT" ? "" : subKey,
			);
			colors.push({ [key]: colorGroup });
		}
	}
	return colors;
}

//TODO: IDK man, can't get this typing right.
const customTwMerge = extendTailwindMerge({
	//@ts-expect-error - I don't know how to type this.
	theme: {
		colors: formatColors(),
		borderRadius: Object.keys(extendedTheme.borderRadius),
	},
	classGroups: {
		"font-size": [
			{
				text: Object.keys(extendedTheme.fontSize),
			},
		],
		animate: [
			{
				animate: Object.keys(extendedTheme.animation),
			},
		],
	},
});

export function cn(...inputs: ClassValue[]) {
	return customTwMerge(clsx(inputs));
}

export async function downloadFile(url: string, retries: number = 0) {
	const MAX_RETRIES = 3;
	try {
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`Failed to fetch image with status ${response.status}`);
		}
		const contentType = response.headers.get("content-type") ?? "image/jpg";
		const blob = Buffer.from(await response.arrayBuffer());
		return { contentType, blob };
	} catch (e) {
		if (retries > MAX_RETRIES) throw e;
		return downloadFile(url, retries + 1);
	}
}

/**
 * Combine multiple response init objects into one (uses combineHeaders)
 */
export function combineResponseInits(
	...responseInits: Array<ResponseInit | null | undefined>
) {
	let combined: ResponseInit = {};
	for (const responseInit of responseInits) {
		combined = {
			...responseInit,
			headers: combineHeaders(combined.headers, responseInit?.headers),
		};
	}
	return combined;
}
