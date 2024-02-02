import { getFormProps, useForm } from "@conform-to/react";
import { ActionFunctionArgs, json, redirect } from "@remix-run/node";
import { parseWithZod, getZodConstraint } from "@conform-to/zod";
import * as E from "@react-email/components";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { sendEmail } from "~/utils/email.server";
import { prepareVerification } from "~/utils/verify.server";
import { prisma } from "@dactylo/db";
import { z } from "zod";
// import { validateCSRF } from "~/utils/csrf.server";
// import { AuthenticityTokenInput } from "remix-utils/csrf/react";

const SIGNUP_SCHEMA = z.object({
	email: z
		.string({ required_error: "Email is required" })
		.email("Email is invalid"),
});

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	// await validateCSRF(formData, request.headers);

	const submission = await parseWithZod(formData, {
		schema: SIGNUP_SCHEMA.superRefine(async (data, ctx) => {
			const exisitngUser = await prisma.user.findUnique({
				where: { email: data.email },
				select: { id: true },
			});
			if (exisitngUser) {
				ctx.addIssue({
					path: ["email"],
					code: z.ZodIssueCode.custom,
					message: "Email is already taken",
				});
				return;
			}
		}),
		async: true,
	});

	if (submission.status !== "success") {
		return json(
			{ result: submission.reply() },
			{ status: submission.status === "error" ? 400 : 200 },
		);
	}
	const { email } = submission.value;
	const { verifyUrl, redirectTo, otp } = await prepareVerification({
		period: 10 * 60,
		request,
		type: "onboarding",
		target: email,
	});
	const response = await sendEmail({
		to: email,
		subject: "Welcome to Dactylo!",
		react: <SignupEmail onboardingUrl={verifyUrl.toString()} otp={otp} />,
	});
	if (response.status === "success") {
		return redirect(redirectTo.toString());
	}
	return json(
		{
			result: submission.reply({ formErrors: [response.error.message] }),
		},
		{
			status: 500,
		},
	);
}

export default function SignupRoute() {
	const actionData = useActionData<typeof action>();
	const [form, fields] = useForm({
		constraint: getZodConstraint(SIGNUP_SCHEMA),
		lastResult: actionData?.result,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: SIGNUP_SCHEMA });
		},
		shouldValidate: "onBlur",
	});
	return (
		<div>
			<Form method="POST" {...getFormProps(form)}>
				<div className="flex flex-col gap-y-2 w-full">
					<Input
						data-1p-ignore
						type="email"
						name="email"
						required
						placeholder="Email"
						// defaultValue={fields.email.defaultValue}
					/>
					<div>{fields.email.errors}</div>

					<Button>Sign Up</Button>
				</div>
			</Form>
		</div>
	);
}

function SignupEmail({
	onboardingUrl,
	otp,
}: {
	onboardingUrl: string;
	otp: string;
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>Welcome to Dactylo!</E.Text>
				</h1>
				<p>
					<E.Text>
						This is your verification code: <strong>{otp}</strong>
					</E.Text>
				</p>
				<p>
					<E.Text>Or click the link to get started:</E.Text>
				</p>
				<E.Link href={onboardingUrl}>{onboardingUrl}</E.Link>
			</E.Container>
		</E.Html>
	);
}
