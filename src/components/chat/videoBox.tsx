import * as React from "react"

interface videoBoxProps {
    stream : MediaStream | null;
    muted? : boolean;
}


const VideoBox = ({stream,muted = false}:videoBoxProps) =>{
    const videoRef = React.useRef<HTMLVideoElement>(null);

    React.useEffect(()=>{
        if(videoRef.current && stream){
            videoRef.current.srcObject = stream;
        }
    },[stream]);
    return(
        <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className="w-full h-full object-cover rounded-lg bg-black"
        />
    )
}


export default VideoBox;