import { createId as cuid } from "@paralleldrive/cuid2";
import { redirect } from "@remix-run/node";
import { GoogleStrategy } from "remix-auth-google";
import { z } from "zod";
import { connectionSessionStorage } from "~/utils/connections.server";
import { type AuthProvider } from "~/utils/providers/provider";
import { Timings } from "~/utils/timing.server";
import { cache, cachified } from "~/utils/cache.server";

const GoogleUserSchema = z.object({ login: z.string() });
const GoogleUserParseResult = z
  .object({
    success: z.literal(true),
    data: GoogleUserSchema
  })
  .or(
    z.object({
      success: z.literal(false)
    })
  );

const shouldMock = process.env.GOOGLE_CLIENT_ID?.startsWith("MOCK_");

export class GoogleProvider implements AuthProvider {
  getAuthStrategy() {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET)
      throw new Error("No GOOGLE_CLIENT_ID");
    return new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback"
      },
      async ({ profile }) => {
        const email = profile.emails[0].value.trim().toLowerCase();
        const username = profile.displayName;
        const imageUrl = profile.photos[0].value;
        return {
          email,
          id: profile.id,
          username,
          name: profile.name.givenName,
          imageUrl
        };
      }
    );
  }

  async resolveConnectionData(
    providerId: string,
    { timings }: { timings?: Timings } = {}
  ) {
    const result = await cachified({
      key: `connection-data:google:${providerId}`,
      cache,
      timings,
      ttl: 1000 * 60,
      swr: 1000 * 60 * 60 * 24 * 7,
      async getFreshValue(context) {
        await new Promise((r) => setTimeout(r, 3000));
        const response = await fetch(
          `https://api.google.com/user/${providerId}`,
          { headers: { Authorization: `token ${process.env.GOOGLE_TOKEN}` } }
        );
        const rawJson = await response.json();
        console.log("rawJson", rawJson);
        const result = GoogleUserSchema.safeParse(rawJson);
        if (!result.success) {
          // if it was unsuccessful, then we should kick it out of the cache
          // asap and try again.
          context.metadata.ttl = 0;
        }
        return result;
      },
      checkValue: GoogleUserParseResult
    });
    return {
      displayName: result.success ? result.data.login : "Unknown",
      link: result.success ? `https://google.com/${result.data.login}` : null
    } as const;
  }

  async handleMockAction(request: Request) {
    if (!shouldMock) return;

    const connectionSession = await connectionSessionStorage.getSession(
      request.headers.get("cookie")
    );
    const state = cuid();
    connectionSession.set("oauth2:state", state);
    const code = "MOCK_CODE_GOOGLE_KODY";
    const searchParams = new URLSearchParams({ code, state });
    throw redirect(`/auth/google/callback?${searchParams}`, {
      headers: {
        "set-cookie": await connectionSessionStorage.commitSession(
          connectionSession
        )
      }
    });
  }
}
