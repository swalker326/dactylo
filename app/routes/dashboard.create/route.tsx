import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import CameraComponent from "~/components/camera";
import { Input } from "~/components/ui/input";
import { SignSelect } from "../resources.sign/SignSelect";
import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { z } from "zod";
import { CameraIcon } from "lucide-react";
import { Button } from "~/components/ui/button";

const UploadFormSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a file" }),
  sign: z.string({
    required_error: "Please select a sign",
    invalid_type_error: "That's not a sign"
  })
});

export default function CreateRoute() {
  const fetcher = useFetcher();
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // [1
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, { file, sign }] = useForm({
    constraint: getFieldsetConstraint(UploadFormSchema),
    // defaultValue: { redirectTo },
    // lastSubmission: fetcher.data?.submission,
    onValidate({ formData }) {
      return parse(formData, { schema: UploadFormSchema });
    }
  });
  const handleRecordingCompleted = async (blobUrl: string) => {
    if (fileInputRef.current) {
      try {
        // Fetch the blob data from the blob URL
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Create a new File object from the blob
        const file = new File([blob], "recorded-video.webm", {
          type: "video/webm"
        });
        console.log(file);

        // Use DataTransfer to correctly set the file to the input
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        setVideoUrl(URL.createObjectURL(file));
      } catch (error) {
        console.error("Error processing the recorded video:", error);
      }
    }
  };

  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-4xl">Create</h2>
      <fetcher.Form
        {...form.props}
        method="POST"
        encType="multipart/form-data"
        action="/dashboard/upload"
        className="flex flex-col gap-y-2"
      >
        <SignSelect {...sign} />
        <CameraComponent
          onRecordingComplete={handleRecordingCompleted}
          label={<CameraIcon size={32} />}
        />
        <Input
          className="hidden"
          type="file"
          name={file.name}
          ref={fileInputRef}
        />
        {videoUrl && (
          <video controls>
            <source src={videoUrl} />
            <track kind="captions" />
          </video>
        )}
        <Button type="submit">Upload</Button>
      </fetcher.Form>
    </div>
  );
}
