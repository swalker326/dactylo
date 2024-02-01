import * as E from "@react-email/components";

export function NewRequestTemplate({
	term,
	definition,
	example,
	requestId,
}: { term: string; definition: string; example: string; requestId: string }) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>New Sign Request</E.Text>
				</h1>
				<p>
					<E.Text>
						<strong>{term}</strong> has been requested with the definition{" "}
						<strong>{definition}</strong> and the example{" "}
						<strong>{example}</strong>.{" "}
						<E.Link href={`${process.env.HOST_NAME}/admin/requests/${requestId}`}>Review the request</E.Link>
					</E.Text>
				</p>
			</E.Container>
		</E.Html>
	);
}
