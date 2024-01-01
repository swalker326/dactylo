import * as E from "@react-email/components";
import { ActionFunctionArgs } from "@remix-run/node";
import { requireUserId } from "~/services/auth.server";
import { invariant } from "@epic-web/invariant";
import { prisma } from "~/db.server";
import { sendEmail } from "~/utils/email.server";
import { convertToMp4, generateFileName } from "~/utils/video.server";
import { typedjson } from "remix-typedjson";
import { uploadHandler } from "~/utils/storage.server";
import { uploadThumbnail } from "~/utils/gif.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Error("Not logged in");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  const formData = await request.formData();

  //CONSTRUCTOR IS FILE
  const file = formData.get("file");
  console.log("FILE:: ", file?.constructor.name);

  invariant(file instanceof File, "No file uploaded");
  invariant(user, "No user found");

  const signId = formData.get("sign");
  const sign = await prisma.sign.findUnique({
    where: { id: signId as string }
  });
  invariant(sign, `No sign found matching id ${signId}`);
  const { name, key } = generateFileName({ name: sign.term, prefix: "video" });
  const { mp4File } = await convertToMp4({
    video: file,
    name: sign.term
  });

  const { url: videoUrl } = await uploadHandler({
    data: mp4File,
    contentType: "video/mp4",
    filename: name
  });
  if (!videoUrl) {
    throw new Error("Failed to upload video");
  }

  const { thumbnailUrl } = await uploadThumbnail({
    video: file,
    name: sign.term,
    key
  });
  const dbVideo = await prisma.video.create({
    data: {
      name,
      url: videoUrl,
      status: "UNDER_REVIEW",
      uploaderInfo: JSON.stringify({}),
      thumbnailUrl,
      user: { connect: { id: userId } },
      sign: { connect: { id: signId as string } }
    }
  });

  const updatedSign = await prisma.sign.update({
    where: { id: signId as string },
    data: {
      videos: {
        connect: [{ id: dbVideo.id }]
      }
    }
  });
  sendEmail({
    to: "shane@swalker.dev",
    subject: "New video uploaded for review",
    react: (
      <NewUploadEmailTemplate videoUrl={dbVideo.url} userEmail={user.email} />
    )
  });

  return typedjson({ sign: updatedSign });
}

function NewUploadEmailTemplate({
  videoUrl,
  userEmail
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
