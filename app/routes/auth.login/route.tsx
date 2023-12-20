import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
  json,
  type ActionFunctionArgs,
  type LoaderFunctionArgs
} from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { login, requireAnonymous } from "~/services/auth.server";
import { validateCSRF } from "~/utils/csrf.server";
import { PasswordSchema } from "~/utils/user-validation";
import { handleNewSession } from "./login";

const LoginFormSchema = z.object({
  email: z.string().email(),
  password: PasswordSchema,
  redirectTo: z.string().optional(),
  remember: z.boolean().optional()
});

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function LoginRoute() {
  const actionData = useActionData<typeof action>();
  const [form, fields] = useForm({
    id: "login-form",
    constraint: getFieldsetConstraint(LoginFormSchema),
    // defaultValue: { redirectTo },
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: LoginFormSchema });
    },
    shouldRevalidate: "onBlur"
  });

  return (
    <div className="w-full space-y-1">
      {actionData?.submission.error.login && (
        <div className="p-3 bg-red-200 text-red-600 rounded-md">
          {actionData.submission.error.login}
        </div>
      )}
      <Form method="POST" className="max-w-3xl" {...form.props}>
        <AuthenticityTokenInput />
        <div className="flex flex-col gap-y-2 w-full">
          <Input placeholder="email" type="email" name="email" required />
          {fields.email.error && (
            <p className="text-red-500">{fields.email.error}</p>
          )}
          <Input
            placeholder="password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
          />
          {fields.email.error && (
            <p className="text-red-500">{fields.password.error}</p>
          )}
          <Button>Sign In</Button>
        </div>
      </Form>
    </div>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAnonymous(request);
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  const submission = await parse(formData, {
    schema: (intent) =>
      LoginFormSchema.transform(async (data, ctx) => {
        if (intent !== "submit") return { ...data, session: null };

        const session = await login(data);
        if (!session) {
          ctx.addIssue({
            path: ["login"],
            code: z.ZodIssueCode.custom,
            message: "Invalid username or password"
          });
          return z.NEVER;
        }

        return { ...data, session };
      }),
    async: true
  });

  delete submission.payload.password;
  if (submission.intent !== "submit") {
    // @ts-expect-error - conform should probably have support for doing this
    delete submission.value?.password;
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value?.session) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  const { session, remember } = submission.value;

  return handleNewSession({
    request,
    remember: remember ?? false,
    session
  });
}

export async function loader({ request }: LoaderFunctionArgs) {
  await requireAnonymous(request);
  return json({});
}
