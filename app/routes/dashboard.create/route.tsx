import { useFetcher } from "@remix-run/react";
import { useRef, useState } from "react";
import CameraComponent from "~/components/camera";
import { Input } from "~/components/ui/input";
import { SignSelect } from "../resources.sign/SignSelect";
import { z } from "zod";
import { CameraIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useZodErrors } from "~/hooks/useZodErrors";

const UploadFormSchema = z.object({
  file: z.instanceof(File, { message: "Please upload a file" }),
  sign: z
    .string({
      required_error: "Please select a sign",
      invalid_type_error: "That's not a sign"
    })
    .min(8, { message: "That's not a sign" })
});
// type UploadFormData = z.infer<typeof UploadFormSchema>;

export default function CreateRoute() {
  const fetcher = useFetcher();
  const isSubmitting = fetcher.formData?.has("sign");
  const [videoUrl, setVideoUrl] = useState<string | null>(null); // [1
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { parse, errorMessages, error } = useZodErrors(UploadFormSchema);

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
  console.log("ERRORS: ", errorMessages);
  console.log("ERROR: ", error);

  return (
    <div className="flex flex-col gap-y-3">
      <h2 className="text-4xl">Create</h2>
      <fetcher.Form
        method="POST"
        encType="multipart/form-data"
        action="/dashboard/upload"
        className="flex flex-col gap-y-2"
        onSubmit={async (event) => {
          event.preventDefault();
          if (fetcher.state !== "idle") return;
          const formData = new FormData(event.currentTarget);
          const success = await parse(formData);
          console.log("SUCCESS??", success);
          if (success) {
            fetcher.submit(formData, {
              method: "POST",
              action: "/dashboard/upload",
              navigate: false,
              encType: "multipart/form-data"
            });
          } else {
            console.log("error");
          }
        }}
      >
        <SignSelect name="sign" />
        {errorMessages?.sign && (
          <p className="bg-red-300 rounded-sm w-full p-2">
            {errorMessages["sign"]}
          </p>
        )}
        <div className="w-full space-y-3 flex flex-col items-center">
          <CameraComponent
            onRecordingComplete={handleRecordingCompleted}
            label={<CameraIcon size={32} />}
          />
          <h6>OR</h6>
          <div className="flex w-full">
            <Input
              className={`${
                fileInputRef.current?.files?.length &&
                fileInputRef.current?.files?.length > 0
                  ? "rounded-r-none"
                  : ""
              }`}
              type="file"
              accept="video/*"
              name="file"
              ref={fileInputRef}
            />
            {fileInputRef.current?.files?.length &&
            fileInputRef.current?.files?.length > 0 ? (
              <button
                className="bg-primary text-white  p-1 rounded-r-md "
                onClick={() => {
                  fileInputRef.current?.value &&
                    (fileInputRef.current.value = "");
                  setVideoUrl(null);
                }}
              >
                <X size={22} />
              </button>
            ) : null}
          </div>
          {errorMessages?.file && (
            <p className="bg-red-300 rounded-sm w-full p-2">
              {errorMessages.file}
            </p>
          )}
        </div>
        {videoUrl && (
          <div className="relative">
            <button
              className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10"
              onClick={() => {
                fileInputRef.current?.value &&
                  (fileInputRef.current.value = "");
                setVideoUrl(null);
              }}
            >
              <X size={22} />
            </button>
            <video controls>
              <source src={videoUrl} />
              <track kind="captions" />
            </video>
          </div>
        )}
        <div className="pt-6">
          <Button className="float-right" type="submit" disabled={isSubmitting}>
            Upload
          </Button>
        </div>
      </fetcher.Form>
    </div>
  );
}
