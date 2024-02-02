import { prisma } from "@dactylo/db";
import { RequestStatus, RequestType } from "@dactylo/db/types";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { requireUserId } from "~/services/auth.server";
import { sendEmail } from "~/utils/email.server";
import { NewRequestTemplate } from "./RequestEmail";
import { getZodConstraint, parseWithZod } from "@conform-to/zod";
// import { toast } from "sonner";
// import { useEffect } from "react";
import { z } from "zod";
import { getFormProps, useForm } from "@conform-to/react";
import { redirect } from "@remix-run/node";

const SignCreateSchema = z.object({
	term: z.string(),
	definition: z.string(),
	example: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request, { redirectTo: "/login" });
	const formData = await request.formData();

	const submission = parseWithZod(formData, { schema: SignCreateSchema });
	if (submission.status !== "success") {
		return submission.reply();
	}

	const { term, definition, example } = submission.value;
	const newRequest = await prisma.request.create({
		data: {
			requestType: RequestType.SIGN,
			status: RequestStatus.PENDING,
			userId,
			term,
			definition,
			example,
		},
	});
	await sendEmail({
		to: "shane@swalker.dev",
		subject: `New Request - ${term}`,
		react: (
			<NewRequestTemplate
				term={term}
				definition={definition}
				example={example}
				requestId={newRequest.id}
			/>
		),
	});

	// toast.success("Your request has been submitted for approval");
	// not sure how to redirect with toast.
	return redirect("/dashboard");
}

export default function SignCreateRoute() {
	const lastResult = useActionData<typeof action>();

	const [form, fields] = useForm({
		lastResult,
		shouldValidate: "onBlur",
		constraint: getZodConstraint(SignCreateSchema),
	});

	return (
		<div className="bg-white w-full p-1.5 py-3 rounded-lg">
			<Form {...getFormProps(form)} method="POST">
				<div className="space-y-3">
					<h2 className="text-2xl">Create a Sign</h2>
					<p>
						You can submit a new sign for approval. All you need is the word or
						parse, a definition, and a brief example. Once the sign is approved
						<span className="font-semibold"> (normally within 24 hours)</span>{" "}
						you and all of the other users can submit videos for it.
					</p>
					<div className="flex flex-col gap-3">
						<Input
							id={fields.term.id}
							name="term"
							placeholder="Word"
							aria-invalid={fields.term.errors ? true : undefined}
							aria-describedby={
								fields.term.errors ? fields.term.errorId : undefined
							}
						/>
						<div className="text-red-500">{fields.term.errors}</div>

						<textarea
							id={fields.definition.id}
							aria-invalid={fields.definition.errors ? true : undefined}
							aria-describedby={
								fields.definition.errors ? fields.definition.errorId : undefined
							}
							rows={3}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
							name="definition"
							placeholder="Definition"
						/>
						<div className="text-red-500">{fields.definition.errors}</div>
						<textarea
							id={fields.example.id}
							rows={3}
							aria-invalid={fields.example.errors ? true : undefined}
							aria-describedby={
								fields.example.errors ? fields.example.errorId : undefined
							}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
							name="example"
							placeholder="Example"
						/>
						<div className="text-red-500">{fields.example.errors}</div>
					</div>
					<Button className="w-1/2 float-right">Submit</Button>
				</div>
			</Form>
		</div>
	);
}
