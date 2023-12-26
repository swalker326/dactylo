import { useFetcher } from "@remix-run/react";
import { useRef } from "react";
import CameraComponent from "~/components/camera";
import { Input } from "~/components/ui/input";
import { SignSelect } from "../resources.sign/SignSelect";
import { useForm } from "@conform-to/react";
import { getFieldsetConstraint, parse } from "@conform-to/zod";
import { z } from "zod";

const UploadFormSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a file" }),
  sign: z.string({
    required_error: "Please select a sign",
    invalid_type_error: "That's not a sign"
  })
});

export default function CreateRoute() {
  const fetcher = useFetcher();
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
      } catch (error) {
        console.error("Error processing the recorded video:", error);
      }
    }
  };

  return (
    <div className="flex flex-col">
      <h2 className="text-4xl">Create</h2>
      <fetcher.Form
        {...form.props}
        method="POST"
        encType="multipart/form-data"
        action="/dashboard/upload"
      >
        <SignSelect {...sign} />
        <Input type="file" name={file.name} ref={fileInputRef} />
        <button type="submit">Upload</button>
      </fetcher.Form>
      {fileInputRef &&
        fileInputRef.current &&
        fileInputRef.current.files &&
        fileInputRef.current.files.length > 0 && (
          <video controls>
            <source src={URL.createObjectURL(fileInputRef.current.files[0])} />
            <track kind="captions" />
          </video>
        )}
      <CameraComponent onRecordingComplete={handleRecordingCompleted} />
    </div>
  );
}
