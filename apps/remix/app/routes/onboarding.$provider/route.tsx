import { conform, useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import {
  json,
  redirect,
  type MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams,
  type Params,
  Link
} from "@remix-run/react";
import { safeRedirect } from "remix-utils/safe-redirect";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { prisma } from "@dactylo/db";
import {
  authenticator,
  requireAnonymous,
  sessionKey,
  signupWithConnection
} from "~/services/auth.server";
import { authSessionStorage } from "~/services/session.server";
import { ProviderNameSchema } from "~/utils/connections";

// import { useIsPending } from "~/utils/misc";
// import { authSessionStorage } from "~/utils/session.server";
import { redirectWithToast } from "~/utils/toast.server";
// import { NameSchema, UsernameSchema } from "~/utils/user-validation";
import { verifySessionStorage } from "~/utils/verification.server";
import { VerifyFunctionArgs } from "~/utils/verify.server";
import {
  onboardingEmailSessionKey,
  prefilledProfileKey,
  providerIdKey
} from "./providerOnboarding";
// import { type VerifyFunctionArgs } from "./verify.js";

const SignupFormSchema = z.object({
  imageUrl: z.string().optional(),
  // username: UsernameSchema,
  // name: NameSchema,
  agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
    required_error: "You must agree to the terms of service and privacy policy"
  }),
  // remember: z.boolean().optional(),
  redirectTo: z.string().optional()
});

async function requireData({
  request,
  params
}: {
  request: Request;
  params: Params;
}) {
  await requireAnonymous(request);
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie")
  );
  const email = verifySession.get(onboardingEmailSessionKey);
  const providerId = verifySession.get(providerIdKey);
  const result = z
    .object({
      email: z.string(),
      providerName: ProviderNameSchema,
      providerId: z.string()
    })
    .safeParse({ email, providerName: params.provider, providerId });
  if (result.success) {
    return result.data;
  } else {
    console.error(result.error);
    throw redirect("/signup");
  }
}

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { email } = await requireData({ request, params });
  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie")
  );
  const prefilledProfile = verifySession.get(prefilledProfileKey);

  const formError = authSession.get(authenticator.sessionErrorKey);

  return json({
    email,
    status: "idle",
    submission: {
      intent: "",
      payload: (prefilledProfile ?? {}) as Record<string, unknown>,
      error: {
        "": typeof formError === "string" ? [formError] : []
      }
    }
  });
}

export async function action({ request, params }: ActionFunctionArgs) {
  const { email, providerId, providerName } = await requireData({
    request,
    params
  });
  const formData = await request.formData();
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie")
  );

  const submission = await parse(formData, {
    schema: SignupFormSchema.superRefine(async (data, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: { id: true }
      });
      if (existingUser) {
        ctx.addIssue({
          path: ["username"],
          code: z.ZodIssueCode.custom,
          message: "A user already exi with this username"
        });
        return;
      }
    }).transform(async (data) => {
      const session = await signupWithConnection({
        ...data,
        email,
        providerId,
        providerName
      });
      return { ...data, session };
    }),
    async: true
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value?.session) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { session, redirectTo } = submission.value;

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  authSession.set(sessionKey, session.id);
  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: session.expirationDate
    })
  );
  headers.append(
    "set-cookie",
    await verifySessionStorage.destroySession(verifySession)
  );

  return redirectWithToast(
    safeRedirect(redirectTo),
    { title: "Welcome", description: "Thanks for signing up!" },
    { headers }
  );
}

export const meta: MetaFunction = () => {
  return [{ title: "Setup Dactylo Account" }];
};

export default function SignupRoute() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  // const isPending = useIsPending();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [
    form,
    {
      imageUrl,
      agreeToTermsOfServiceAndPrivacyPolicy,
      redirectTo: redirect
      // remember
    }
  ] = useForm({
    id: "onboarding-provider-form",
    constraint: getFieldsetConstraint(SignupFormSchema),
    lastSubmission: actionData?.submission ?? data.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  console.log(agreeToTermsOfServiceAndPrivacyPolicy);
  return (
    <div className="container flex min-h-full flex-col justify-center pb-32 pt-20">
      <div className="mx-auto w-full">
        <div className="flex flex-col gap-3 text-center">
          <h1 className="text-h1">Welcome aboard {data.email}!</h1>
          <p className="text-body-md text-muted-foreground">
            Please enter your details.
          </p>
        </div>
        <Form
          method="POST"
          className="mx-auto min-w-full max-w-lg sm:min-w-[368px] flex flex-col gap-2"
          {...form.props}
        >
          {imageUrl.defaultValue ? (
            <div className="mb-4 flex flex-col items-center justify-center gap-4">
              <img
                src={imageUrl.defaultValue}
                alt="Profile"
                className="h-24 w-24 rounded-full"
              />
              <p className="text-body-sm text-muted-foreground">
                You can change your photo later
              </p>
              <input {...conform.input(imageUrl, { type: "hidden" })} />
            </div>
          ) : null}

          <div className="flex items-center space-x-2">
            <Checkbox
              className="flex-shrink-1"
              name={agreeToTermsOfServiceAndPrivacyPolicy.name}
              // {...agreeToTermsOfServiceAndPrivacyPolicy}
            />
            <label
              className="flex-grow-1 text-sm"
              htmlFor="agreeToTermsOfServiceAndPrivacyPolicy"
            >
              Do you agree to our{" "}
              <Link rel="_" className="text-blue-500 underline" to="/tos">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link rel="_" className="text-blue-500 underline" to="/privacy">
                Privacy Policy?
              </Link>
            </label>
          </div>
          {agreeToTermsOfServiceAndPrivacyPolicy.error ? (
            <div className="text-red-500 bg-red-100 p-3 rounded-md">
              {agreeToTermsOfServiceAndPrivacyPolicy.error}
            </div>
          ) : null}

          {/* <div className="flex items-center space-x-2">
            <Checkbox {...remember} />
            <label htmlFor="remember">Remember me</label>
          </div> */}

          {redirectTo ? (
            <input type="hidden" name="redirectTo" value={redirectTo} />
          ) : null}

          {/* <ErrorList errors={form.errors} id={form.errorId} /> */}

          <div className="flex items-center justify-between gap-6">
            <Button
              className="w-full"
              // status={isPending ? "pending" : actionData?.status ?? "idle"}
              type="submit"
              // disabled={isPending}
            >
              Create an account
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
