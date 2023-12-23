import { Circle, Play, Pause, DownloadIcon, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom";
import useCamera from "~/hooks/useCamera";
import useCameraRecorder from "~/hooks/useCameraRecorder";

const CameraComponent: React.FC = () => {
  const { stream } = useCamera();
  const {
    startRecording,
    stopRecording,
    mediaBlobUrl,
    isRecording,
    setMediaBlobUrl
  } = useCameraRecorder(stream);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [cameraPortal, setCameraPortal] = useState<HTMLElement | null>(null);

  const retake = () => setMediaBlobUrl(null);

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

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      const handleVideoEnd = () => setIsPlaying(false);

      videoElement.addEventListener("ended", handleVideoEnd);

      return () => {
        videoElement.removeEventListener("ended", handleVideoEnd);
      };
    }
  }, []);

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const CameraContent = (
    <div className="fixed inset-0 bg-black z-50">
      <div ref={containerRef} className="relative flex justify-center">
        <button
          onClick={() => setCameraActive(false)}
          className="absolute top-2 right-2 p-2 text-white border border-white rounded-full z-20"
        >
          <X size={24} />
        </button>
        <video
          autoPlay={!mediaBlobUrl}
          playsInline
          ref={videoRef}
          className="w-[100svw] h-[100svh] object-contain"
          controls={false}
          src={mediaBlobUrl ? mediaBlobUrl : ""}
        >
          <track kind="captions" />
        </video>
        <div className="absolute h-12 bottom-0 bg-gray-300 bg-opacity-60 z-10 w-full p-1.5 flex justify-between text-white">
          <div>
            {mediaBlobUrl && (
              <button onClick={retake}>
                <p>Retake</p>
              </button>
            )}
          </div>
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2">
            {stream && !isRecording && !mediaBlobUrl && (
              <button className="text-red-500" onClick={startRecording}>
                <Circle size={32} />
              </button>
            )}
            {isRecording && (
              <button onClick={stopRecording}>
                <Circle size={24} />
              </button>
            )}
            {mediaBlobUrl && (
              <button onClick={togglePlayback}>
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
            )}
          </div>
          <div>
            {mediaBlobUrl && (
              <a href={mediaBlobUrl} download="recorded-video.webm">
                <DownloadIcon size={24} />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setCameraActive(true)}
        className="bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 transition duration-300"
      >
        Open Camera
      </button>
      {cameraActive &&
        cameraPortal &&
        isClient &&
        ReactDOM.createPortal(CameraContent, cameraPortal)}
    </>
  );
};

export default CameraComponent;
