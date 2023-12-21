import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";

import { ActionFunctionArgs, json } from "@remix-run/node";
import { useSearchParams, useActionData, Form } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { Input } from "~/components/ui/input";
import { validateCSRF } from "~/utils/csrf.server";
import {
  codeQueryParam,
  targetQueryParam,
  redirectToQueryParam,
  VerifySchema,
  validateRequest
} from "./verify";
import { Button } from "~/components/ui/button";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  console.log("Hi");
  await validateCSRF(formData, request.headers);
  return validateRequest(request, formData);
}

export async function loader() {
  return json({ test: "test" });
}

export default function VerifyRoute() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const verifyType = searchParams.get("type");
  console.log(verifyType);
  const [form, { code, redirectTo, target, type }] = useForm({
    id: "verify-form",
    constraint: getFieldsetConstraint(VerifySchema),
    lastSubmission: actionData?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: VerifySchema });
    },
    defaultValue: {
      code: searchParams.get(codeQueryParam) ?? "",
      type: verifyType ?? "",
      target: searchParams.get(targetQueryParam) ?? "",
      redirectTo: searchParams.get(redirectToQueryParam) ?? ""
    }
  });
  console.log(target.defaultValue);
  console.log(type.defaultValue);
  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        {verifyType ? (
          <>
            <h1 className="text-h1">Check your email</h1>
            <p className="mt-3 text-body-md text-muted-foreground">
              We have sent you a code to verify your email address.
            </p>
          </>
        ) : (
          "Invalid Verification Type"
        )}
      </div>

      <div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
        <div className="flex w-full gap-2">
          <Form method="POST" {...form.props}>
            <AuthenticityTokenInput />
            <Input {...code} type="hidden" />
            <input {...type} type="hidden" />
            <input {...target} type="hidden" />
            <input {...redirectTo} type="hidden" />
            <Button>Submit</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
