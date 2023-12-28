import { invariant } from "@epic-web/invariant";
import { redirect } from "@remix-run/node";
import { verifySessionStorage } from "~/utils/verification.server";
import { VerifyFunctionArgs } from "~/utils/verify.server";

export const onboardingEmailSessionKey = "onboardingEmail";
export const providerIdKey = "providerId";
export const prefilledProfileKey = "prefilledProfile";

export async function handleVerification({ submission }: VerifyFunctionArgs) {
  invariant(submission.value, "submission.value should be defined by now");
  const verifySession = await verifySessionStorage.getSession();
  verifySession.set(onboardingEmailSessionKey, submission.value.target);
  return redirect("auth/onboarding", {
    headers: {
      "set-cookie": await verifySessionStorage.commitSession(verifySession)
    }
  });
}
