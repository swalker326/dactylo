import { ActionFunctionArgs, LoaderFunctionArgs, json } from "@remix-run/node";
import { z } from "zod";
import { PasswordAndConfirmPasswordSchema } from "~/utils/user-validation";
import { verifySessionStorage } from "~/utils/verification.server";

import { authSessionStorage } from "~/services/session.server";
import { sessionKey, signup } from "~/services/auth.server";
import { validateCSRF } from "~/utils/csrf.server";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { prisma } from "~/db.server";
import { redirectWithToast } from "~/utils/toast.server";
import { safeRedirect } from "remix-utils/safe-redirect";
import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useSearchParams
} from "@remix-run/react";
import { useForm } from "@conform-to/react";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { getSessionEmail } from "./onboarding";
import { Checkbox } from "~/components/ui/checkbox";

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
  console.log("ON BOARDING DATA", data);
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [form] = useForm({
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
      <Form method="POST" {...form.props} className="space-y-3">
        <AuthenticityTokenInput />
        <Input type="password" name="password" placeholder="Password" />
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Confirm Password"
        />
        <div className="flex items-center gap-2 justify-center">
          <Checkbox name="agreeToTermsOfServiceAndPrivacyPolicy" />
          <label htmlFor="agreeToTermsOfServiceAndPrivacyPolicy">
            <Link
              className="text-blue-300"
              to="/terms-of-service"
              target="_blank"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              className="text-blue-300"
              to="/privacy-policy"
              target="_blank"
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        <Button>Sign Up</Button>
      </Form>
    </>
  );
}
