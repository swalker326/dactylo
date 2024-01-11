import { createCookieSessionStorage } from "@remix-run/node";

// export the whole sessionStorage object
export const authSessionStorage = createCookieSessionStorage({
	cookie: {
		name: "authSession",
		sameSite: "lax",
		path: "/",
		httpOnly: true,
		secrets: ["mys3cr3t"],
		secure: process.env.NODE_ENV === "production",
	},
});

// you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = authSessionStorage;
