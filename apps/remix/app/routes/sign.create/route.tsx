import { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
  const term = formData.get("term");
  const definition = formData.get("definition");
  const example = formData.get("example");
  if (!term || !definition || !example) {
    return new Response("Missing required fields", { status: 400 });
  }
}

export default function SignCreateRoute() {
	return (
		<div className="bg-white w-full p-1.5 py-3 rounded-lg">
			<Form>
				<div className="space-y-3">
					<h2 className="text-2xl">Create a Sign</h2>
					<p>
						You can submit a new sign for approval. All you need is the word or
						parse, a definition, and a brief example. Once the sign is approved
						<span className="font-semibold"> (normally within 24 hours)</span>{" "}
						you and all of the other users can submit videos for it.
					</p>
					<div className="flex flex-col gap-3">
						<Input name="term" placeholder="Term" />
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
