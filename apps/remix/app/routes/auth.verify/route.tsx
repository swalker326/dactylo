import { getFormProps, getInputProps, useForm } from "@conform-to/react";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";

import { ActionFunctionArgs, json } from "@remix-run/node";
import { useSearchParams, useActionData, Form } from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { Input } from "~/components/ui/input";
import { validateCSRF } from "~/utils/csrf.server";
import {
	// codeQueryParam,
	// targetQueryParam,
	// redirectToQueryParam,
	validateRequest,
} from "../../utils/verify.server";
const types = ["onboarding", "reset-password", "change-email", "2fa"] as const;
const VerificationTypeSchema = z.enum(types);
const VerifySchema = z.object({
	code: z.string().min(6).max(6),
	type: VerificationTypeSchema,
	target: z.string(),
	redirectTo: z.string().optional(),
});

import { Button } from "~/components/ui/button";
import { z } from "zod";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	await validateCSRF(formData, request.headers);
	return validateRequest(request, formData);
}

export async function loader() {
	return json({ test: "test" });
}

export default function VerifyRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	const parseWithZodType = VerificationTypeSchema.safeParse(
		searchParams.get("type"),
	);
	const verifyType = parseWithZodType.success ? parseWithZodType.data : null;
	const [form, { code, redirectTo, target, type }] = useForm({
		id: "verify-form",
		constraint: getZodConstraint(VerifySchema),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: VerifySchema });
		},
		defaultValue: {
			code: searchParams.get("code") ?? "",
			type: verifyType ?? "",
			target: searchParams.get("target") ?? "",
			redirectTo: searchParams.get("redirectTo") ?? "",
		},
	});
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
				<Form
					method="POST"
					{...getFormProps(form)}
					className="flex flex-col w-full gap-3"
				>
					<AuthenticityTokenInput />
					<Input {...getInputProps(code, { type: "text" })} />
					{code.errors && (
						<div className="bg-red-100 text-red-600 p-1 px-2 rounded-md">
							{code.errors}
						</div>
					)}
					<input {...getInputProps(type, { type: "hidden" })} />
					<input {...getInputProps(target, { type: "hidden" })} />
					<input {...getInputProps(redirectTo, { type: "hidden" })} />
					<div className="w-full flex justify-center">
						<Button>Submit</Button>
					</div>
				</Form>
			</div>
		</div>
	);
}
