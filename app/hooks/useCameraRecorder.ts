import { useState, useEffect, SetStateAction, Dispatch } from "react";

interface CameraRecorderHook {
  startRecording: () => void;
  stopRecording: () => void;
  mediaBlobUrl: string | null;
  isRecording: boolean;
  setMediaBlobUrl: Dispatch<SetStateAction<string | null>>;
}

function useCameraRecorder(stream: MediaStream | null): CameraRecorderHook {
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [mediaBlobUrl, setMediaBlobUrl] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);

  useEffect(() => {
    if (stream) {
      const recorder = new MediaRecorder(stream);
      setMediaRecorder(recorder);

      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        setMediaBlobUrl(URL.createObjectURL(blob));
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
    setMediaBlobUrl,
    startRecording,
    stopRecording,
    mediaBlobUrl,
    isRecording
  };
}

export default useCameraRecorder;
