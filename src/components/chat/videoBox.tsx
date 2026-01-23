import * as React from "react"
import { Mic, MicOff } from "lucide-react";
import VideoPlaceholder from "./VideoPlaceholder";
interface videoBoxProps {
    stream : MediaStream | null;
    cameraOff? : boolean;
    user? : boolean;
    micOff? : boolean;
}

const VideoBox = ({ stream, cameraOff, micOff, user }: videoBoxProps) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden">
      
      {/* VIDEO (always mounted → audio safe) */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={user}   // ✅ local muted, remote not
        className={`w-full h-full object-cover bg-black transition-opacity duration-200 ${
          cameraOff ? "opacity-0" : "opacity-100"
        }`}
      />

      {/* CAMERA OFF OVERLAY */}
      {cameraOff && (
        <VideoPlaceholder
          label={user ? "You" : "Stranger"}
          isUser={user}
         type={user ? "user" : "cameraOff"}    // ✅ THIS WAS MISSING
          className="absolute inset-0 z-10"
        />
      )}

      {/* MIC OFF ICON (optional UI) */}
      {micOff && !user && (
        <div className="absolute bottom-3 right-3 z-20">
          <MicOff className="w-5 h-5 text-red-500" />
        </div>
      )}
    </div>
  );
};


export default VideoBox;