import { redirect } from "@remix-run/node";
import { safeRedirect } from "remix-utils/safe-redirect";
import { prisma } from "@dactylo/db";
import { twoFAVerificationType, getRedirectToUrl } from "~/utils/verify.server";
import { sessionKey } from "~/services/auth.server";
import { authSessionStorage } from "~/services/session.server";
import { combineResponseInits } from "~/utils/misc";
import { verifySessionStorage } from "~/utils/verification.server";

const unverifiedSessionIdKey = "unverified-session-id";
const rememberKey = "remember";

export async function handleNewSession(
  {
    request,
    session,
    redirectTo,
    remember
  }: {
    request: Request;
    session: { userId: string; id: string; expirationDate: Date };
    redirectTo?: string;
    remember: boolean;
  },
  responseInit?: ResponseInit
) {
  const verification = await prisma.verification.findUnique({
    select: { id: true },
    where: {
      target_type: { target: session.userId, type: twoFAVerificationType }
    }
  });
  const userHasTwoFactor = Boolean(verification);

  if (userHasTwoFactor) {
    const verifySession = await verifySessionStorage.getSession();
    verifySession.set(unverifiedSessionIdKey, session.id);
    verifySession.set(rememberKey, remember);
    const redirectUrl = getRedirectToUrl({
      request,
      type: twoFAVerificationType,
      target: session.userId,
      redirectTo
    });
    return redirect(
      `${redirectUrl.pathname}?${redirectUrl.searchParams}`,
      combineResponseInits(
        {
          headers: {
            "set-cookie": await verifySessionStorage.commitSession(
              verifySession
            )
          }
        },
        responseInit
      )
    );
  } else {
    const authSession = await authSessionStorage.getSession(
      request.headers.get("cookie")
    );
    authSession.set(sessionKey, session.id);

    return redirect(
      safeRedirect(redirectTo),
      combineResponseInits(
        {
          headers: {
            "set-cookie": await authSessionStorage.commitSession(authSession, {
              expires: remember ? session.expirationDate : undefined
            })
          }
        },
        responseInit
      )
    );
  }
}
