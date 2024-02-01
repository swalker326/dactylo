import { prisma } from "@dactylo/db";
import { RequestStatus, RequestType } from "@dactylo/db/types";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { requireUserId } from "~/services/auth.server";
import { sendEmail } from "~/utils/email.server";
import { NewRequestTemplate } from "./RequestEmail";
import { toast } from "sonner";
import { useEffect } from "react";

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	if (!userId) {
		return new Response("You must be logged in to request a new sign", {
			status: 401,
		});
	}
	const formData = await request.formData();
	const term = formData.get("term") as string;
	const definition = formData.get("definition") as string;
	const example = formData.get("example") as string;
	if (!term || !definition || !example) {
		return new Response("Missing required fields", { status: 400 });
	}
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
	sendEmail({
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
	return json({ success: true });
}

export default function SignCreateRoute() {
	const actionData = useActionData<typeof action>();
	useEffect(() => {
		if (actionData?.success) {
			toast("Your sign request has been submitted for approval");
		}
	}, [actionData]);
	return (
		<div className="bg-white w-full p-1.5 py-3 rounded-lg">
			<Form method="POST">
				<div className="space-y-3">
					<h2 className="text-2xl">Create a Sign</h2>
					<p>
						You can submit a new sign for approval. All you need is the word or
						parse, a definition, and a brief example. Once the sign is approved
						<span className="font-semibold"> (normally within 24 hours)</span>{" "}
						you and all of the other users can submit videos for it.
					</p>
					<div className="flex flex-col gap-3">
						<Input name="term" placeholder="Word" />
						<textarea
							rows={3}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
							name="definition"
							placeholder="Definition"
						/>
						<textarea
							rows={3}
							className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 "
							name="example"
							placeholder="Example"
						/>
					</div>
					<Button className="w-1/2 float-right">Submit</Button>
				</div>
			</Form>
		</div>
	);
}
