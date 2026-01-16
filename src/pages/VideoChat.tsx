import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft, MessageCircle } from "lucide-react";
import VideoPlaceholder from "@/components/chat/VideoPlaceholder";
import ChatPanel from "@/components/chat/ChatPanel";
import ControlButton from "@/components/chat/ControlButton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { socket } from "@/services/socket";
import { useUserWebRTC } from "@/hooks/user-webrtc";
import { useAppSelector } from "@/hooks/use-app-selector";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import VideoBox from "@/components/chat/videoBox";

const VideoChat = () => {
  const navigate = useNavigate();
  const roomId = useAppSelector(state => state.global.roomId);
  const creater = useAppSelector(state => state.global.creater);
  console.log(roomId,"this is vidochat",creater);
  if(!roomId) navigate("/");
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; time: string }[]>([]);

  const  {isConnected,createOffer,peerConnection,createChannel,listenChannel,sendMessage,closeConnection} = useUserWebRTC(roomId);
  console.log(isConnected,"isconnected...........");
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  useEffect(()=>{
    if (!peerConnection || localStream) return;
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setLocalStream(stream);

      stream.getTracks().forEach(track => {
        peerConnection.addTrack(track, stream);
      });

      // setup remote stream
      const remote = new MediaStream();
      setRemoteStream(remote);

      peerConnection.ontrack = (event) => {
        event.streams[0].getTracks().forEach(track => {
          remote.addTrack(track);
        });
      };
    };
    startCamera();
  },[peerConnection])
  
  useEffect(() => {
    if (!peerConnection || isConnected || !localStream) return;
    console.log("useEffect in vidochatComponent");
    if (creater) {
      createChannel((msg) => {
        setMessages(prev => [
          ...prev,
          { text: msg, isUser: false, time: new Date().toLocaleTimeString() }
        ]);
      });
      createOffer();
    } else {
      listenChannel((msg) => {
        setMessages(prev => [
          ...prev,
          { text: msg, isUser: false, time: new Date().toLocaleTimeString() }
        ]);
      });
    }
    socket.once("peer_left", () => {
      console.log("Peer has left the call");
      closeConnection();
    });
    return () => {
      console.log("unmount.............");
    }
  }, [peerConnection,isConnected,localStream]);

  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  

  const handleEndCall = () => {
    localStream?.getTracks().forEach(t => t.stop());
  remoteStream?.getTracks().forEach(t => t.stop());
    closeConnection();
    socket.emit("leave",true);
  };
  const handleSendMessage = (text: string) => {
  if(!isConnected) return 
  sendMessage(text);
  setMessages(prev => [
    ...prev,
    { text, isUser: true, time: new Date().toLocaleTimeString() }
  ]);
};

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 md:h-14 border-b border-border flex items-center px-3 md:px-4 shrink-0">
        <AlertDialog>
          <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm"  className="px-2 md:px-3">
                <ArrowLeft className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Leave</span>
              </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Leave the Video Chat ?
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave ?
                 {isConnected ? "your current connection will be closed." :".."} 
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={()=>{handleEndCall();navigate('/');}}>Yes, Leave</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-foreground">Video Chat</span>
          <span className={`ml-2 text-xs ${isConnected ? "text-green-500" : "text-destructive"}`}>
            • {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
        <div className="w-10 md:w-20" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 md:flex-[7] flex flex-col p-2 md:p-4 gap-2 md:gap-4">
          {/* {status === "disconnected" ? ( */}
          {!isConnected ? (

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 px-4">
                <p className="text-lg md:text-xl text-muted-foreground">Stranger disconnected</p>
                <Button onClick={() => navigate("/finding?type=video")} className="h-12 px-6">
                  Find New Stranger
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 relative">

                {/* Video Grid - PiP on mobile */}
                <div className="md:hidden w-full h-full relative">
                  {/* Stranger video - full size */}
                  {/* <VideoPlaceholder label="Stranger" className="w-full h-full" /> */}
                  <VideoBox stream={remoteStream} />
                  
                  {/* Self video - PiP on mobile, stacked on desktop */}
                  <div className="absolute top-2 right-2 w-24 h-32">
                    {/* <VideoPlaceholder label="You" isUser className="w-full h-full shadow-lg" /> */}
                     <VideoBox stream={localStream} muted />

                  </div>
                </div>
                {/* Desktop: stacked layout */}
                <div className="hidden md:grid md:grid-rows-2 md:gap-4 md:absolute md:inset-0">
                    <VideoBox stream={localStream} muted />
                    <VideoBox stream={remoteStream} />
                  {/* <VideoPlaceholder label="You" isUser className="w-full h-full" />
                  <VideoPlaceholder label="Stranger" className="w-full h-full" /> */}
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 md:gap-4 py-2 md:py-2">
                <ControlButton
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? "Unmute" : "Mute"}
                  variant={isMuted ? "active" : "default"}
                  onClick={() => setIsMuted(!isMuted)}
                />
                <ControlButton
                  icon={isCameraOff ? VideoOff : Video}
                  label={isCameraOff ? "Start" : "Stop"}
                  variant={isCameraOff ? "active" : "default"}
                  onClick={() => setIsCameraOff(!isCameraOff)}
                />
                <ControlButton
                  icon={PhoneOff}
                  label="End"
                  variant="destructive"
                  onClick={handleEndCall}
                />
                
                {/* Mobile chat trigger */}
                <Drawer>
                  <DrawerTrigger asChild>
                    <button className="md:hidden flex flex-col items-center gap-1.5 p-3 md:p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all duration-200 hover:scale-105 active:scale-95">
                      <MessageCircle className="w-5 h-5 md:w-5 md:h-5" />
                      <span className="text-[10px] font-medium">Chat</span>
                    </button>
                  </DrawerTrigger>
                  <DrawerContent className="h-[70vh]">
                    <ChatPanel 
                    messages={messages}
                    onSend={handleSendMessage}
                    />
                  </DrawerContent>
                </Drawer>
              </div>
            </>
          )}
        </div>

        {/* Chat Section - Hidden on mobile */}
        <div className="hidden md:block md:flex-[3] md:min-w-[280px] md:max-w-[400px]">
          <ChatPanel 
          messages={messages}
          onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoChat;
