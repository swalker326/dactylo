import { useState, useEffect } from "react";

interface CameraHook {
  stream: MediaStream | null;
  error: Error | null;
  devices: MediaDeviceInfo[];
  updateStream: (deviceId: string) => Promise<void>;
  initCamera: () => Promise<void>;
}

function useCamera(): CameraHook {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  // const [hasPermission, setHasPermission] = useState<boolean>(false);

  const updateStream = async (deviceId: string) => {
    const device = devices.find((device) => device.deviceId === deviceId);
    if (!device) {
      throw new Error("Device not found");
    }
    if (stream) {
      const tracks = stream.getTracks();
      tracks.forEach((track) => track.stop());
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId }
      });
      setStream(stream);
    } catch (err) {
      setError(err as Error);
    }
  };
  const initCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      const devices = await navigator.mediaDevices.enumerateDevices();
      setDevices(
        devices.filter(
          (device) => device.kind === "videoinput" && device.deviceId !== ""
        )
      );
      setStream(stream);
    } catch (err) {
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        const allowed = err.name === "NotAllowedError";
        // TODO: use this to re-prompt if the user comes back after denying.
        localStorage.setItem("cameraAllowed", allowed.toString());
        // TODO: Show a message to the user
      }
      setError(err as Error);
    }
  };

  useEffect(() => {
    if (!stream) {
      initCamera();
    }

    // Cleanup function
    return () => {
      if (stream) {
        const tracks = stream.getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  return { stream, error, devices, updateStream, initCamera };
}

export default useCamera;
