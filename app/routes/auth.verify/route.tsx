import { useForm, conform } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { Button } from "@react-email/components";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useSearchParams, useActionData, Form } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { Input } from "~/components/ui/input";
import { validateCSRF } from "~/utils/csrf.server";
import {
  typeQueryParam,
  codeQueryParam,
  targetQueryParam,
  redirectToQueryParam,
  VerifySchema,
  validateRequest
} from "./verify";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  await validateCSRF(formData, request.headers);
  return validateRequest(request, formData);
}

export async function loader() {
  console.log("HI HEY");
  return json({ test: "test" });
}

export default function VerifyRoute() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const verifyType = searchParams.get("type");
  const [form, fields] = useForm({
    // id: "verify-form",
    // TODO: uncomment this and it breaks
    // constraint: getFieldsetConstraint(VerifySchema),
    lastSubmission: actionData?.submission
    // TODO: uncomment this and it breaks
    // onValidate({ formData }) {
    //   return parse(formData, { schema: VerifySchema });
    // }
    // TODO: uncomment this and it breaks
    // defaultValue: {
    //   code: searchParams.get(codeQueryParam) ?? "",
    //   type: verifyType ?? "",
    //   target: searchParams.get(targetQueryParam) ?? "",
    //   redirectTo: searchParams.get(redirectToQueryParam) ?? ""
    // }
  });
  // if (!true) {
  //   return (
  //     <main className="container flex flex-col justify-center pb-32 pt-20">
  //       <div className="text-center">
  //         <h1 className="text-h1">Invalid Verification Type</h1>
  //       </div>
  //     </main>
  //   );
  // }
  return (
    <div className="container flex flex-col justify-center pb-32 pt-20">
      <div className="text-center">
        {/* {true ? (
          <>
            <h1 className="text-h1">Check your email</h1>
            <p className="mt-3 text-body-md text-muted-foreground">
              We have sent you a code to verify your email address.
            </p>
          </>
        ) : (
          "Invalid Verification Type"
        )} */}
      </div>

      <div className="mx-auto flex w-72 max-w-full flex-col justify-center gap-1">
        {/* <div>
          <ErrorList errors={form.errors} id={form.errorId} />
        </div> */}
        <div className="flex w-full gap-2">
          <Form method="POST" {...form.props}>
            {/* <AuthenticityTokenInput /> */}
            <Input name="code" />
            <input name="typeQueryParam" type="hidden" />
            <input name="targetQueryParam" type="hidden" />
            <input name="redirectToQueryParam" type="hidden" />
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
