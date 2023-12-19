import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { Form, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";
import { prisma } from "~/db.server";
import { getDomainUrl } from "~/utils/misc";
import { generateTOTP, verifyTOTP } from "~/utils/totp.server";
import { validateCSRF } from "~/utils/csrf.server";
import { Submission, useForm, conform } from "@conform-to/react";
import { verifySessionStorage } from "~/utils/verification.server";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";

export const codeQueryParam = "code";
export const targetQueryParam = "target";
export const typeQueryParam = "type";
export const redirectToQueryParam = "redirectTo";

const types = ["onboarding", "reset-password", "change-email", "2fa"] as const;
export const onboardingEmailSessionKey = "onboardingEmail";
const VerificationTypeSchema = z.enum(types);
export type VerificationTypes = z.infer<typeof VerificationTypeSchema>;
export const twoFAVerificationType = "2fa" satisfies VerificationTypes;
const VerifySchema = z.object({
  [codeQueryParam]: z.string().min(6).max(6),
  [typeQueryParam]: VerificationTypeSchema,
  [targetQueryParam]: z.string(),
  [redirectToQueryParam]: z.string().optional()
});

export type VerifyFunctionArgs = {
  request: Request;
  submission: Submission<z.infer<typeof VerifySchema>>;
  body: FormData | URLSearchParams;
};
export function getRedirectToUrl({
  request,
  type,
  target,
  redirectTo
}: {
  request: Request;
  type: VerificationTypes;
  target: string;
  redirectTo?: string;
}) {
  const redirectToUrl = new URL(`${getDomainUrl(request)}/auth/verify`);
  redirectToUrl.searchParams.set(typeQueryParam, type);
  redirectToUrl.searchParams.set(targetQueryParam, target);
  if (redirectTo) {
    redirectToUrl.searchParams.set(redirectToQueryParam, redirectTo);
  }
  return redirectToUrl;
}

export async function prepareVerification({
  period,
  request,
  type,
  target
}: {
  period: number;
  request: Request;
  type: VerificationTypes;
  target: string;
}) {
  const verifyUrl = getRedirectToUrl({ request, type, target });
  const redirectTo = new URL(verifyUrl.toString());

  const { otp, ...verificationConfig } = generateTOTP({
    algorithm: "SHA256",
    // Leaving off 0 and O on purpose to avoid confusing users.
    charSet: "ABCDEFGHIJKLMNPQRSTUVWXYZ123456789",
    period
  });
  const verificationData = {
    type,
    target,
    ...verificationConfig,
    expiresAt: new Date(Date.now() + verificationConfig.period * 1000)
  };
  await prisma.verification.upsert({
    where: { target_type: { target, type } },
    create: verificationData,
    update: verificationData
  });

  // add the otp to the url we'll email the user.
  verifyUrl.searchParams.set(codeQueryParam, otp);

  return { otp, redirectTo, verifyUrl };
}

export async function handleOnboardingVerification({
  submission
}: VerifyFunctionArgs) {
  invariant(submission.value, "submission.value should be defined by now");
  const verifySession = await verifySessionStorage.getSession();
  verifySession.set(onboardingEmailSessionKey, submission.value.target);
  return redirect("/auth/onboarding", {
    headers: {
      "set-cookie": await verifySessionStorage.commitSession(verifySession)
    }
  });
}

export async function isCodeValid({
  code,
  type,
  target
}: {
  code: string;
  type: VerificationTypes | typeof twoFAVerificationType;
  target: string;
}) {
  const verification = await prisma.verification.findUnique({
    where: {
      target_type: { target, type },
      OR: [{ expiresAt: { gt: new Date() } }, { expiresAt: null }]
    },
    select: { algorithm: true, secret: true, period: true, charSet: true }
  });
  if (!verification) return false;
  const result = verifyTOTP({
    otp: code,
    ...verification
  });
  if (!result) return false;

  return true;
}

async function validateRequest(
  request: Request,
  body: URLSearchParams | FormData
) {
  const submission = await parse(body, {
    schema: VerifySchema.superRefine(async (data, ctx) => {
      const codeIsValid = await isCodeValid({
        code: data[codeQueryParam],
        type: data[typeQueryParam],
        target: data[targetQueryParam]
      });
      if (!codeIsValid) {
        ctx.addIssue({
          path: ["code"],
          code: z.ZodIssueCode.custom,
          message: `Invalid code`
        });
        return;
      }
    }),
    async: true
  });

  if (submission.intent !== "submit") {
    return json({ status: "idle", submission } as const);
  }
  if (!submission.value) {
    return json({ status: "error", submission } as const, { status: 400 });
  }

  // this code path could be part of a loader (GET request), so we need to make
  // sure we're running on primary because we're about to make writes.
  // await ensurePrimary();

  const { value: submissionValue } = submission;

  async function deleteVerification() {
    await prisma.verification.delete({
      where: {
        target_type: {
          type: submissionValue[typeQueryParam],
          target: submissionValue[targetQueryParam]
        }
      }
    });
  }

  switch (submissionValue[typeQueryParam]) {
    // case "reset-password": {
    //   await deleteVerification();
    //   return handleResetPasswordVerification({ request, body, submission });
    // }
    case "onboarding": {
      await deleteVerification();
      return handleOnboardingVerification({ request, body, submission });
    }
    // case "change-email": {
    //   await deleteVerification();
    //   return handleChangeEmailVerification({ request, body, submission });
    // }
    // case "2fa": {
    //   return handleLoginTwoFactorVerification({ request, body, submission });
    // }
  }
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  return validateRequest(request, formData);
}

export default function VerifyRoute() {
  const [searchParams] = useSearchParams();
  const actionData = useActionData<typeof action>();
  const parsedType = VerificationTypeSchema.safeParse(
    searchParams.get(typeQueryParam)
  );
  const type = parsedType.success ? parsedType.data : null;
  const checkEmail = (
    <>
      <h1 className="text-h1">Check your email</h1>
      <p className="mt-3 text-body-md text-muted-foreground">
        We've sent you a code to verify your email address.
      </p>
    </>
  );
  const [form, fields] = useForm({
    id: "verify-form",
    constraint: getFieldsetConstraint(VerifySchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: VerifySchema });
    },
    defaultValue: {
      code: searchParams.get(codeQueryParam) ?? "",
      type,
      target: searchParams.get(targetQueryParam) ?? "",
      redirectTo: searchParams.get(redirectToQueryParam) ?? ""
    }
  });
  return (
    <main className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        {type ? checkEmail : "Invalid Verification Type"}
      </div>

      <div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
        {/* <div>
          <ErrorList errors={form.errors} id={form.errorId} />
        </div> */}
        <div className="flex w-full gap-2">
          <Form method="POST" {...form.props} className="flex-1">
            <AuthenticityTokenInput />
            <Input
              {...conform.input(fields[codeQueryParam])}
              // labelProps={{
              //   htmlFor: fields[codeQueryParam].id,
              //   children: "Code"
              // }}
              // inputProps={{
              //   ...conform.input(fields[codeQueryParam]),
              //   autoComplete: "one-time-code"
              // }}
              // errors={fields[codeQueryParam].errors}
            />
            <input
              {...conform.input(fields[typeQueryParam], { type: "hidden" })}
            />
            <input
              {...conform.input(fields[targetQueryParam], { type: "hidden" })}
            />
            <input
              {...conform.input(fields[redirectToQueryParam], {
                type: "hidden"
              })}
            />
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      </div>
    </main>
  );
}
