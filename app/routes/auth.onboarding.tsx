import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect
} from "@remix-run/node";
import { z } from "zod";
import { PasswordAndConfirmPasswordSchema } from "~/utils/user-validation";
import { verifySessionStorage } from "~/utils/verification.server";
import { onboardingEmailSessionKey } from "./auth.verify";
import { authSessionStorage } from "~/services/session.server";
import { sessionKey, signup } from "~/services/auth.server";
import { validateCSRF } from "~/utils/csrf.server";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { prisma } from "~/db.server";
import { redirectWithToast } from "~/utils/toast.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import {
  Form,
  useActionData,
  useLoaderData,
  useSearchParams
} from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

const SignupFormSchema = z
  .object({
    agreeToTermsOfServiceAndPrivacyPolicy: z.boolean({
      required_error:
        "You must agree to the terms of service and privacy policy"
    }),
    remember: z.boolean().optional(),
    redirectTo: z.string().optional()
  })
  .and(PasswordAndConfirmPasswordSchema);

const getSessionEmail = async (request: Request) => {
  const verifySession = await verifySessionStorage.getSession(
    request.headers.get("cookie")
  );
  const email = verifySession.get(onboardingEmailSessionKey);
  if (typeof email !== "string" || !email) {
    throw redirect("/signup");
  }
  return email;
};

export async function action({ request }: ActionFunctionArgs) {
  const email = await getSessionEmail(request);
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const submission = await parse(formData, {
    schema: (intent) =>
      SignupFormSchema.superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findUnique({
          where: { email: email },
          select: { id: true }
        });
        if (existingUser) {
          ctx.addIssue({
            path: ["email"],
            code: z.ZodIssueCode.custom,
            message: "A user already exists with this email"
          });
          return;
        }
      }).transform(async (data) => {
        if (intent !== "submit") return { ...data, session: null };

        const session = await signup({ ...data, email });
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

  const { session, remember, redirectTo } = submission.value;

  const authSession = await authSessionStorage.getSession(
    request.headers.get("cookie")
  );
  authSession.set(sessionKey, session.id);
  const verifySession = await verifySessionStorage.getSession();
  const headers = new Headers();
  headers.append(
    "set-cookie",
    await authSessionStorage.commitSession(authSession, {
      expires: remember ? session.expirationDate : undefined
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
export async function loader({ request }: LoaderFunctionArgs) {
  const email = await getSessionEmail(request);
  return json({ email });
}

export default function SignupRoute() {
  const data = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form, fields] = useForm({
    id: "onboarding-form",
    constraint: getFieldsetConstraint(SignupFormSchema),
    defaultValue: { redirectTo },
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: SignupFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <>
      {form.errors.toString()}
      <Form method="POST" {...form.props}>
        <AuthenticityTokenInput />
        <Input name="password" />
        <Input name="confirmPassword" />
        <Input type="checkbox" name="agreeToTermsOfServiceAndPrivacyPolicy" />
        <label htmlFor="agreeToTermsOfServiceAndPrivacyPolicy">
          I agree to the{" "}
          <a href="/terms-of-service" target="_blank">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" target="_blank">
            Privacy Policy
          </a>
        </label>
        <Button>Sign Up</Button>
      </Form>
    </>
  );
}
