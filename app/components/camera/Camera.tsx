import { Circle, X, CameraIcon, Check } from "lucide-react";
import ReactDOM from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import useCamera from "~/hooks/useCamera";
import useCameraRecorder from "~/hooks/useCameraRecorder";
import { Button } from "~/components/ui/button";
import { CameraSelector } from "~/components/camera/CameraSelector";
import CircularProgress from "./CircularProgress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "../ui/alert-dialog";

export const CameraComponent = ({
  onRecordingComplete,
  label
}: {
  label?: React.ReactNode;
  onRecordingComplete: (blobUrl: string) => void;
}) => {
  const { stream, devices, updateStream, error, initCamera } = useCamera();
  const {
    startRecording,
    stopRecording,
    mediaBlobUrl,
    isRecording,
    setMediaBlobUrl
  } = useCameraRecorder(stream);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [cameraPortal, setCameraPortal] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    setCameraPortal(document.getElementById("camera-root"));
  }, [stream]);

  useEffect(() => {
    if (videoRef.current) {
      if (mediaBlobUrl) {
        videoRef.current.srcObject = null;
      } else {
        videoRef.current.srcObject = stream;
      }
    }
  }, [stream, mediaBlobUrl, cameraActive]);

  // denied access to camera
  if (error) {
    if (error instanceof DOMException && error.name === "NotAllowedError") {
      return (
        <div className="flex flex-col items-center justify-center">
          <p className="text-2xl text-center">
            Please allow access to your camera
          </p>
          <Button onClick={initCamera} type="button">
            Retry
          </Button>
        </div>
      );
    }
  }
  // no camera found
  if (!devices.length) {
    return (
      <div className="flex flex-col items-center justify-center">
        <p className="text-2xl text-center">No camera found</p>
        <Button onClick={initCamera} type="button">
          Retry
        </Button>
      </div>
    );
  }
  const handleCloseCamera = () => {
    if (mediaBlobUrl) {
      setMediaBlobUrl(null);
    } else {
      setCameraActive(false);
    }
  };

  const CameraContent = (
    <div className="fixed inset-0 bg-black z-50">
      <div ref={containerRef} className="relative flex justify-center">
        <AlertDialog>
          <AlertDialogTrigger asChild className="absolute top-4 right-4 z-20">
            <button className="text-white rounded-full border p-2">
              <X size={20} />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="w-11/12 rounded-md">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                {mediaBlobUrl
                  ? "You will lose your recording are you sure?"
                  : "You have not recorded anything yet, would you like to go back?"}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>
                {mediaBlobUrl ? "Keep My Recording" : "Stay Here"}
              </AlertDialogCancel>
              <AlertDialogAction>
                <button type="button" onClick={handleCloseCamera}>
                  {mediaBlobUrl ? "Discard" : "Yes, Leave"}
                </button>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <video
          autoPlay={true}
          loop={!!mediaBlobUrl}
          playsInline
          ref={videoRef}
          className="w-[100svw] h-[100svh] object-contain"
          controls={false}
          src={mediaBlobUrl ? mediaBlobUrl : ""}
        >
          <track kind="captions" />
        </video>
        <div className="fixed bottom-0 z-10 w-full p-1.5 flex justify-between text-white min-h-20">
          <CameraSelector devices={devices} onSelect={updateStream} />
          <div>
            {stream && !isRecording && !mediaBlobUrl && (
              <button className="text-red-500" onClick={startRecording}>
                <Circle size={66} />
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording}>
                <CircularProgress
                  duration={10000}
                  onEnd={() => stopRecording()}
                />
              </button>
            )}
          </div>
          <div className="w-20 flex items-center justify-center">
            {mediaBlobUrl && (
              <button
                type="button"
                onClick={() => {
                  setCameraActive(false);
                  onRecordingComplete(mediaBlobUrl);
                }}
              >
                <Check size={24} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <Button
        className="w-full"
        type="button"
        onClick={() => setCameraActive(true)}
      >
        {label || <CameraIcon />}
      </Button>
      {cameraActive &&
        cameraPortal &&
        isClient &&
        ReactDOM.createPortal(CameraContent, cameraPortal)}
    </>
  );
};
