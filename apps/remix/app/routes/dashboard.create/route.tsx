import { useEffect, useRef, useState } from "react";
import { CameraComponent } from "~/components/camera/Camera";
import { Input } from "~/components/ui/input";
import { SignSelect } from "../resources.sign/SignSelect";
import { z } from "zod";
import { CameraIcon, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useZodErrors } from "~/hooks/useZodErrors";
import { action as uploadAction } from "~/routes/dashboard.upload/route";
import { useTypedFetcher } from "remix-typedjson";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { CameraProvider } from "~/components/camera/CameraProvider";

const UploadFormSchema = z.object({
	file: z
		.instanceof(File, { message: "Please upload a file" })
		.refine((file) => {
			return file.type.startsWith("video/") && file.name !== "";
		}),
	sign: z
		.string({
			required_error: "Please select a sign",
			invalid_type_error: "That's not a sign",
		})
		.min(8, { message: "That's not a sign" }),
});
// type UploadFormData = z.infer<typeof UploadFormSchema>;

export default function CreateRoute() {
	const [mediaBlobURL, setMediaBlobURL] = useState<string>();
	const [searchParams] = useSearchParams();
	const fetcher = useTypedFetcher<typeof uploadAction>();
	const navigate = useNavigate();
	const isSubmitting = fetcher.formData?.has("sign");

	const fileInputRef = useRef<HTMLInputElement>(null);
	const formRef = useRef<HTMLFormElement>(null);
	const { parse, errorMessages } = useZodErrors(UploadFormSchema);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (!isSubmitting && fetcher.data?.sign) {
			formRef.current?.reset();
			setMediaBlobURL(undefined);
			toast(`Sign video added for ${fetcher.data.sign.term}`, {
				description: "Once approved, it will be available for others to see",
				duration: 5000,
				dismissible: true,
				position: "bottom-right",
				action: {
					label: "View in Dashboard",
					onClick: () => navigate("/dashboard"),
				},
			});
		}
	}, [isSubmitting]);

	const handleRecordingCompleted = async () => {
		if (fileInputRef.current) {
			if (!mediaBlobURL) return;
			const response = await fetch(mediaBlobURL);
			const blob = await response.blob();
			const file = new File([blob], "video.webm", { type: "video/webm" });
			try {
				const dataTransfer = new DataTransfer();
				dataTransfer.items.add(file);
				fileInputRef.current.files = dataTransfer.files;
			} catch (error) {
				console.error("Error processing the recorded video:", error);
			}
		}
	};
	console.log("SIGN ID", searchParams.get("signId"));

	return (
		<CameraProvider
			mediaBlobURL={mediaBlobURL}
			setMediaBlobURL={setMediaBlobURL}
		>
			<div className="flex flex-col">
				<fetcher.Form
					ref={formRef}
					method="POST"
					encType="multipart/form-data"
					action="/dashboard/upload"
					className="flex flex-col gap-y-2 py-4 bg-white rounded-md shadow-md sm:px-2.5"
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
								encType: "multipart/form-data",
							});
						}
					}}
				>
					<div className="rounded-md px-1.5">
						<h4 className="text-xl pb-2">Sign</h4>
						<SignSelect
							name="sign"
							defaultValue={(searchParams.get("signId") as string) || undefined}
						/>
						{errorMessages?.sign && (
							<p className="bg-red-300 rounded-sm w-full p-2">
								{errorMessages.sign}
							</p>
						)}
					</div>
					<div className="w-full space-y-3 rounded-md px-1.5">
						<h4 className="text-xl">Video</h4>
						<div className="flex-col flex justify-between gap-x-4 md:items-center md:flex-row ">
							<div>
								<div className="flex">
									<Input
										className={`${mediaBlobURL ? "rounded-r-none" : ""}`}
										type="file"
										onChange={(event) => {
											if (event.currentTarget.files?.length) {
												setMediaBlobURL(
													URL.createObjectURL(event.currentTarget.files[0]),
												);
											}
										}}
										accept="video/*"
										name="file"
										ref={fileInputRef}
									/>
									{mediaBlobURL ? (
										<button
											type="button"
											className="bg-primary text-white  p-1 rounded-r-md "
											onClick={() => {
												if (fileInputRef.current?.value) {
													fileInputRef.current.value = "";
												}
												setMediaBlobURL(undefined);
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
					</div>
					{mediaBlobURL ? (
						<div className="relative">
							<button
								type="button"
								className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 z-10"
								onClick={() => {
									if (fileInputRef.current?.value) {
										fileInputRef.current.value = "";
									}
									setMediaBlobURL(undefined);
								}}
							>
								<X size={22} />
							</button>
							<video
								autoPlay
								playsInline
								muted
								loop
								className="w-full aspect-square"
								src={mediaBlobURL}
							>
								<track kind="captions" />
							</video>
						</div>
					) : null}
					<div className="pt-6 flex justify-end pr-1.5">
						<Button type="submit" disabled={isSubmitting}>
							Upload
						</Button>
					</div>
				</fetcher.Form>
			</div>
		</CameraProvider>
	);
}
