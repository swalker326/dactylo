import { verifySessionStorage } from "~/utils/verification.server";
import { redirect } from "@remix-run/node";
import { onboardingEmailSessionKey } from "~/utils/verify.server";

export const getSessionEmail = async (request: Request) => {
	const verifySession = await verifySessionStorage.getSession(
		request.headers.get("cookie"),
	);
	const email = verifySession.get(onboardingEmailSessionKey);
	if (typeof email !== "string" || !email) {
		throw redirect("/signup");
	}
	return email;
};
