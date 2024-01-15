import { useState, useEffect } from "react";
import { useCameraContext } from "~/components/camera/CameraProvider";

interface CameraRecorderHook {
	startRecording: () => void;
	stopRecording: () => void;
	// mediaBlobUrl: string | null;
	isRecording: boolean;
	// setMediaBlobUrl: Dispatch<SetStateAction<string | null>>;
	// videoBlob: Blob | null;
}

function useCameraRecorder(stream: MediaStream | null): CameraRecorderHook {
	const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
		null,
	);
	const { setMediaBlobURL } = useCameraContext();
	const [isRecording, setIsRecording] = useState<boolean>(false);

	useEffect(() => {
		if (stream) {
			const recorder = new MediaRecorder(stream);
			setMediaRecorder(recorder);

			let chunks: BlobPart[] = [];
			recorder.ondataavailable = (event) => {
				if (event.data.size > 0) {
					chunks.push(event.data);
				}
			};

			recorder.onstop = () => {
				console.log("mimeType: ", mediaRecorder?.mimeType);
				const blob = new Blob(chunks, { type: "video/mp4" });
				setMediaBlobURL(URL.createObjectURL(blob));
				chunks = [];
			};
		}
	}, [stream]);

	const startRecording = () => {
		if (mediaRecorder && mediaRecorder.state === "inactive") {
			mediaRecorder.start();
			setIsRecording(true);
		}
	};

	const stopRecording = () => {
		if (mediaRecorder && mediaRecorder.state === "recording") {
			mediaRecorder.stop();
			setIsRecording(false);
		}
	};

	return {
		startRecording,
		stopRecording,
		isRecording,
	};
}

export default useCameraRecorder;
