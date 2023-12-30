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
  const { parse, errorMessages } = useZodErrors(UploadFormSchema);

  const handleRecordingCompleted = async (blobUrl: string) => {
    if (fileInputRef.current) {
      try {
        // Fetch the blob data from the blob URL
        const response = await fetch(blobUrl);
        const blob = await response.blob();

        // Create a new File object from the blob
        const file = new File([blob], "recorded-video.webm", {
          type: "video/mp4"
        });

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
    <div className="flex flex-col">
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
          if (success) {
            fetcher.submit(formData, {
              method: "POST",
              action: "/dashboard/upload",
              navigate: false,
              encType: "multipart/form-data"
            });
          }
        }}
      >
        <div className="border bg-white p-4 rounded-md">
          <SignSelect name="sign" />
          {errorMessages?.sign && (
            <p className="bg-red-300 rounded-sm w-full p-2">
              {errorMessages["sign"]}
            </p>
          )}
        </div>
        <div className="w-full space-y-3 bg-white p-4 rounded-md">
          <h4 className="text-xl">Video</h4>
          <div className="flex-col flex justify-between gap-x-4 md:items-center md:flex-row border rounded-sm p-6">
            <div>
              <div className="flex">
                <Input
                  className={`${videoUrl ? "rounded-r-none" : ""}`}
                  type="file"
                  onChange={(event) => {
                    if (event.currentTarget.files?.length) {
                      setVideoUrl(
                        URL.createObjectURL(event.currentTarget.files[0])
                      );
                    }
                  }}
                  accept="video/*"
                  name="file"
                  ref={fileInputRef}
                />
                {videoUrl ? (
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
            <div className="w-full md:w-auto text-center py-2">
              <h3 className="text-xl">or</h3>
            </div>
            <div className="flex-shrink">
              <CameraComponent
                onRecordingComplete={handleRecordingCompleted}
                label={
                  <div className="flex gap-x-2 items-center">
                    Record a Video <CameraIcon />
                  </div>
                }
              />
            </div>
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
              <video controls className="w-full max-h-[20rem]">
                <source src={videoUrl} />
                <track kind="captions" />
              </video>
            </div>
          )}
          <div className="pt-6">
            <Button
              className="float-right"
              type="submit"
              disabled={isSubmitting}
            >
              Upload
            </Button>
          </div>
        </div>
      </fetcher.Form>
    </div>
  );
}
