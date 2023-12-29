import * as E from "@react-email/components";
import { v4 as uuidv4 } from "uuid";
import { ActionFunctionArgs, json } from "@remix-run/node";
import { useFetcher, useNavigation } from "@remix-run/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { requireUserId } from "~/services/auth.server";
import {
  FileUploadResponseSchema,
  uploadHandler
} from "~/utils/storage.server";
import { z } from "zod";
import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { invariant } from "@epic-web/invariant";
import { prisma } from "~/db.server";
import { sendEmail } from "~/utils/email.server";
import { uploadGif } from "~/utils/gif.server";
import { SignSelect } from "../resources.sign/SignSelect";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Error("Not logged in");
  }
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });
  const formData = await request.formData();
  const file = formData.get("file");
  invariant(file instanceof File, "No file uploaded");
  invariant(user, "No user found");
  const signId = formData.get("sign");
  const sign = await prisma.sign.findUnique({
    where: { id: signId as string }
  });
  invariant(sign, `No sign found matching id ${signId}`);
  const key = uuidv4();
  const videoUploadResponse = await uploadHandler({
    data: file,
    filename: sign.term,
    contentType: file.type,
    key
  });
  invariant(videoUploadResponse, "No video returned");
  invariant(signId, "No sign selected");
  const parsedUploadResponse = FileUploadResponseSchema.safeParse(
    JSON.parse(videoUploadResponse)
  );
  if (!parsedUploadResponse.success) {
    throw new Error("Invalid video");
  }
  const { gifUrl } = await uploadGif({
    video: file,
    name: sign.term,
    key
  });
  const dbVideo = await prisma.video.create({
    data: {
      name: encodeURIComponent(parsedUploadResponse.data.filename),
      url:
        process.env.STORAGE_ACCESS_URL +
        encodeURIComponent(parsedUploadResponse.data.filename),
      status: "UNDER_REVIEW",
      uploaderInfo: JSON.stringify({}),
      gifUrl,
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

  return json({ sign: updatedSign });
}

const UploadFormSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a file" }),
  sign: z.string({
    required_error: "Please select a sign",
    invalid_type_error: "That's not a sign"
  })
});

export default function DashboardRoute() {
  const navigation = useNavigation();
  const fetcher = useFetcher<typeof action>();
  const isSubmitting = fetcher.formData?.has("intent");
  const [form, { file, sign }] = useForm({
    constraint: getFieldsetConstraint(UploadFormSchema),
    // defaultValue: { redirectTo },
    // lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: UploadFormSchema });
    }
  });

  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-3xl">Upload a New Video</h2>

      <fetcher.Form
        {...form.props}
        action="/dashboard/upload"
        className="flex flex-col gap-y-2"
        method="POST"
        encType="multipart/form-data"
      >
        {/* {sign.error && <p>{sign.error}</p>} */}
        <SignSelect {...sign} />
        {/* <input readOnly name={sign.name} value="clqgq33v500004w8jgjuivbxh" /> */}

        <div className="flex flex-col gap-y-2">
          {file.error && <p>{file.error}</p>}
          <Input type="file" accept="video/*" name={file.name} />
          <Button className="float-right" type="submit" disabled={isSubmitting}>
            {navigation.formAction === "/dashboard/upload"
              ? "Uploading..."
              : "Upload"}
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
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
