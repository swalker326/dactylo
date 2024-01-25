import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import {
	json,
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
} from "@remix-run/node";
import {
	Form,
	Link,
	useActionData,
	useNavigation,
	useSearchParams,
} from "@remix-run/react";
import { AuthenticityTokenInput } from "remix-utils/csrf/react";
import { z } from "zod";
import { Input } from "~/components/ui/input";
import { login, requireAnonymous } from "~/services/auth.server";
import { validateCSRF } from "~/utils/csrf.server";
import { PasswordSchema } from "~/utils/user-validation";
import { handleNewSession } from "./login";
import { ProviderConnectionForm, providerNames } from "~/utils/connections";
import { StatusButton } from "~/components/ui/status-button";
import { Button } from "~/components/ui/button";
import { Separator } from "~/components/ui/separator";

const LoginFormSchema = z.object({
	email: z.string().email(),
	password: PasswordSchema,
	redirectTo: z.string().optional(),
	remember: z.boolean().optional(),
});

// First we create our UI with the form doing a POST and the inputs with the
// names we are going to use in the strategy
export default function LoginRoute() {
	const actionData = useActionData<typeof action>();
	const [searchParams] = useSearchParams();
	const [form, fields] = useForm({
		id: "login-form",
		constraint: getFieldsetConstraint(LoginFormSchema),
		// defaultValue: { redirectTo },
		lastSubmission: actionData?.submission,
		onValidate({ formData }) {
			return parse(formData, { schema: LoginFormSchema });
		},
		shouldRevalidate: "onBlur",
	});
	const redirectTo = searchParams.get("redirectTo");
	const navigation = useNavigation();

	return (
		<div className="flex justify-center p-1.5 flex-col w-full">
			<div>
				<div className="md:p-4">
					{actionData?.submission.error.login && (
						<div className="p-3 bg-red-200 text-red-600 rounded-md">
							{actionData.submission.error.login}
						</div>
					)}
					<Form method="POST" {...form.props}>
						<AuthenticityTokenInput />
						<div className="flex flex-col gap-y-2 w-full pb-2">
							<Input placeholder="Email" type="email" name="email" required />
							{fields.email.error && (
								<p className="text-red-500">{fields.email.error}</p>
							)}
							<Input
								placeholder="Password"
								type="password"
								name="password"
								autoComplete="current-password"
								required
							/>
							<div className="flex justify-end">
								<Link
									to="/auth/onboarding"
									className="text-blue-500 opacity-60 float-right"
								>
									forgot password?
								</Link>
							</div>
							{fields.email.error && (
								<p className="text-red-500">{fields.password.error}</p>
							)}
							<div className="flex justify-between items-center">
								<StatusButton
									type="submit"
									status={
										navigation.formAction === "/auth/login" ? "loading" : "idle"
									}
									className="flex gap-1"
									message="Logging in..."
								>
									<p>Sign In</p>
								</StatusButton>
							</div>
						</div>
					</Form>
					<div className="relative py-2">
						<div className="text-body-xs uppercase absolute left-1/2 bg-gray-100 px-3 text-gray-600 opacity-55 -translate-x-1/2 top-1/2 -translate-y-1/2">
							<p>or login with</p>
						</div>
						<Separator className="my-4" />
					</div>
					<div className="flex flex-col gap-2 p-4 bg-white rounded-lg">
						<div className="p-4 rounded-md flex gap-2 flex-wrap justify-center">
							{providerNames.map((providerName) => (
								<ProviderConnectionForm
									key={providerName}
									type="Login"
									providerName={providerName}
									redirectTo={redirectTo}
								/>
							))}
						</div>
					</div>
					<div className="relative py-2">
						<div className="text-nowrap text-body-xs uppercase absolute left-1/2 bg-gray-100 px-3 top-1/2 -translate-y-1/2 text-gray-600 -translate-x-1/2">
							<p className="opacity-55">or create an account</p>
						</div>
						<Separator className="my-4" />
					</div>

					<Button variant="outline" asChild>
						<Link
							to="/auth/signup"
							className="w-full px-2 py-1.5 border border-gray-500 rounded-lg"
						>
							Create an Account
						</Link>
					</Button>
				</div>
			</div>
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
						message: "Invalid username or password",
					});
					return z.NEVER;
				}

				return { ...data, session };
			}),
		async: true,
	});

	submission.payload.password = undefined;
	if (submission.intent !== "submit") {
		// @ts-expect-error - conform should probably have support for doing this
		//
		// biome-ignore lint/performance/noDelete: I'm not sure of another way?
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
		session,
	});
}

export async function loader({ request }: LoaderFunctionArgs) {
	await requireAnonymous(request);
	return json({});
}
