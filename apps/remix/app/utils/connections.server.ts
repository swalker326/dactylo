import { createCookieSessionStorage } from "@remix-run/node";
import { type ProviderName } from "~/utils/connections";
import { GoogleProvider } from "~/utils/providers/google.server";
import { type AuthProvider } from "~/utils/providers/provider";
import { Timings } from "./timing.server";

export const connectionSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "en_connection",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		secrets: process.env.SESSION_SECRET?.split(",") as string[],
		secure: process.env.NODE_ENV === "production",
	},
});

export const providers: Record<ProviderName, AuthProvider> = {
	google: new GoogleProvider(),
};

export function handleMockAction(providerName: ProviderName, request: Request) {
	return providers[providerName].handleMockAction(request);
}

export function resolveConnectionData(
	providerName: ProviderName,
	providerId: string,
	options?: { timings?: Timings },
) {
	return providers[providerName].resolveConnectionData(providerId, options);
}
