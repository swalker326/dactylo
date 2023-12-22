import { useState, useEffect } from "react";

interface CameraHook {
  stream: MediaStream | null;
  error: Error | null;
}

function useCamera(): CameraHook {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true
        });
        setStream(mediaStream);
      } catch (err) {
        setError(err as Error);
      }
    }

    if (!stream) {
      enableStream();
    }

    // Cleanup function
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return { stream, error };
}

export default useCamera;
