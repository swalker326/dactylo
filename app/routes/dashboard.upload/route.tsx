import { VideoStatus } from "@prisma/client";
import {
  ActionFunctionArgs,
  json,
  unstable_parseMultipartFormData
} from "@remix-run/node";
import { useFetcher } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { prisma } from "~/db.server";
import { requireUserId } from "~/services/auth.server";
import { uploadHandler } from "~/utils/storage.server";

export async function action({ request }: ActionFunctionArgs) {
  const userId = await requireUserId(request);
  if (!userId) {
    throw new Error("Not logged in");
  }
  const formData = await unstable_parseMultipartFormData(
    request,
    uploadHandler
  );

  const file = formData.get("file") as string;
  if (!file) {
    throw new Error("No file uploaded");
  }
  const fileObject = JSON.parse(file);
  const video = await prisma.video.create({
    data: {
      name: encodeURIComponent(fileObject.filename),
      url: fileObject.url,
      status: VideoStatus.UNDER_REVIEW,
      uploaderInfo: JSON.stringify({}),
      user: { connect: { id: userId } }
    }
  });
  console.log(video);

  return json({ video });
}

export default function DashboardRoute() {
  const [rdyToUpload, setRdyToUpload] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<typeof action>();
  useEffect(() => {
    console.log("VALUE:", !!inputRef.current?.value);
    console.log("VALUE:", inputRef.current?.files?.length);
    if (fetcher.state === "idle" && !!inputRef.current?.files?.length) {
      setRdyToUpload(true);
    }
  }, [fetcher.state, inputRef.current?.files, setRdyToUpload]);
  console.log("RDY TO UPLOAD:", rdyToUpload);
  return (
    <div className="flex flex-col gap-y-4">
      <h2 className="text-3xl">Upload a New Video</h2>
      {fetcher.state === "loading" && <p>Uploading...</p>}
      <fetcher.Form method="POST" encType="multipart/form-data">
        <div className="flex flex-col gap-y-2">
          <Input ref={inputRef} type="file" accept="video/*" name="file" />
          <Button className="float-right" type="submit">
            Upload
          </Button>
        </div>
      </fetcher.Form>
      {fetcher.data?.video && (
        <video controls>
          <track kind="captions" />
          <source
            src={`https://pub-a23e49e30e144cf1878114cb90d30a22.r2.dev/${fetcher.data.video.name}`}
          />
        </video>
      )}
    </div>
  );
}
