import { useRemixForm, getValidatedFormData } from "remix-hook-form";
import { useSearchParams, Form } from "@remix-run/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@react-email/components";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { Input } from "~/components/ui/input";
import { validateCSRF } from "~/utils/csrf.server";
import {
  codeQueryParam,
  targetQueryParam,
  redirectToQueryParam,
  VerifySchema,
  validateRequest,
  VerificationTypes
} from "./verify";

type FormData = z.infer<typeof VerifySchema>;
const resolver = zodResolver(VerifySchema);

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const {
    errors,
    // data,
    receivedValues: defaultValues
  } = await getValidatedFormData<FormData>(request, resolver);
  if (errors) {
    return json({ errors, defaultValues }, { status: 400 });
  }
  await validateCSRF(formData, request.headers);
  return validateRequest(request, formData);
}

export async function loader() {
  console.log("HI HEY");
  return json({ test: "test" });
}

export default function VerifyRoute() {
  // const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  const verifyType = searchParams.get("type") as VerificationTypes;
  const {
    handleSubmit,
    formState: { errors },
    register
  } = useRemixForm<FormData>({
    mode: "onSubmit",
    defaultValues: {
      code: searchParams.get(codeQueryParam) ?? "",
      type: verifyType ?? "",
      target: searchParams.get(targetQueryParam) ?? "",
      redirectTo: searchParams.get(redirectToQueryParam) ?? ""
    },
    resolver
  });

  // defaultValue: {
  //   code: searchParams.get(codeQueryParam) ?? "",
  //   type: verifyType ?? "",
  //   target: searchParams.get(targetQueryParam) ?? "",
  //   redirectTo: searchParams.get(redirectToQueryParam) ?? ""
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
          <Form method="POST" onSubmit={handleSubmit}>
            <AuthenticityTokenInput />
            {/* <AuthenticityTokenInput /> */}
            <Input {...register("code")} />
            {errors?.code && (
              <p className="text-red-500">{errors.code.message}</p>
            )}
            <input {...register("type")} type="hidden" />
            <input {...register("target")} type="hidden" />
            <input {...register("redirectTo")} type="hidden" />
            <Button type="submit">Submit</Button>
          </Form>
        </div>
      </div>
    </div>
  );
}
