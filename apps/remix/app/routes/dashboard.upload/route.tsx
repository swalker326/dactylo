import * as E from "@react-email/components";
import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { invariant } from "@epic-web/invariant";
import { prisma } from "@dactylo/db";
import { sendEmail } from "~/utils/email.server";
import { typedjson } from "remix-typedjson";

import { z } from "zod";

const ResponseSchema = z.object({
	id: z.string(),
});

const transcoderUrl =
	import.meta.env.TRANSCODER_URL || "http://localhost:8080/upload";

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request);
	if (!userId) {
		throw new Error("Not logged in");
	}
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});

	const formData = await request.formData();

	//CONSTRUCTOR IS FILE
	const file = formData.get("file");

	invariant(file instanceof File, "No file uploaded");
	invariant(user, "No user found");

	const signId = formData.get("sign");
	const sign = await prisma.sign.findUnique({
		where: { id: signId as string },
	});
	invariant(sign, `No sign found matching id ${signId}`);
	const response = await fetch(transcoderUrl, {
		method: "POST",
		body: formData,
	});
	if (!response.ok) {
		throw new Error("Failed to upload video");
	}
	const rawResponseJson = await response.json();
	const validatedResponse = ResponseSchema.safeParse(rawResponseJson);
	if (validatedResponse.success === false) {
		throw new Error("Failed to upload video");
	}
	const { id } = validatedResponse.data;

	const dbVideo = await prisma.video.create({
		data: {
			videoId: id,
			url: `https://media.dactylo.io/sign-${id}/${id}_<quality>.mp4`,
			status: "UNDER_REVIEW",
			user: { connect: { id: userId } },
			sign: { connect: { id: signId as string } },
		},
	});

	await prisma.sign.update({
		where: { id: signId as string },
		data: {
			videos: {
				connect: [{ id: dbVideo.id }],
			},
		},
	});
	sendEmail({
		to: "shane@swalker.dev",
		subject: "New video uploaded for review",
		react: (
			<NewUploadEmailTemplate videoUrl={dbVideo.url} userEmail={user.email} />
		),
	});

	return typedjson({
		sign: {
			term: "hello",
			id: "123",
		},
	});
}

function NewUploadEmailTemplate({
	videoUrl,
	userEmail,
}: {
	videoUrl: string;
	userEmail: string;
}) {
	return (
		<E.Html lang="en" dir="ltr">
			<E.Container>
				<h1>
					<E.Text>{userEmail} just uploaded a new video for review</E.Text>
				</h1>
				<p>
					<E.Text>
						Checkout the video and reivew it{" "}
						<strong>
							<E.Link href={videoUrl}>here</E.Link>
						</strong>
					</E.Text>
				</p>
			</E.Container>
		</E.Html>
	);
}

/*
  No longer using a component here, just the endpoint
*/

// const UploadFormSchema = z.object({
//   file: z.instanceof(File, { message: "Please upload a file" }),
//   sign: z.string({
//     required_error: "Please select a sign",
//     invalid_type_error: "That's not a sign"
//   })
// });

// export default function DashboardRoute() {
//   const navigation = useNavigation();
//   const fetcher = useFetcher<typeof action>();
//   const isSubmitting = fetcher.formData?.has("intent");
//   const [form, { file, sign }] = useForm({
//     constraint: getFieldsetConstraint(UploadFormSchema),
//     onValidate({ formData }) {
//       return parse(formData, { schema: UploadFormSchema });
//     }
//   });

//   return (
//     <div className="flex flex-col gap-y-4">
//       <h2 className="text-3xl">Upload a New Video</h2>

//       <fetcher.Form
//         {...form.props}
//         action="/dashboard/upload"
//         className="flex flex-col gap-y-2"
//         method="POST"
//         encType="multipart/form-data"
//       >
//         <SignSelect {...sign} />
//         <h1>Hello</h1>
//         <div className="flex flex-col gap-y-2">
//           {file.error && <p>{file.error}</p>}
//           <Input type="file" accept="video/*" name={file.name} />
//           <div className="flex justify-end w-full px-5">
//             <Button type="submit" disabled={isSubmitting}>
//               {navigation.formAction === "/dashboard/upload"
//                 ? "Uploading..."
//                 : "Upload"}
//             </Button>
//           </div>
//         </div>
//       </fetcher.Form>
//     </div>
//   );
// }
