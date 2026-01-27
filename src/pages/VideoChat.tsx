import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, PhoneOff, ArrowLeft, MessageCircle } from "lucide-react";
import VideoPlaceholder from "@/components/chat/VideoPlaceholder";
import ChatPanel from "@/components/chat/ChatPanel";
import ControlButton from "@/components/chat/ControlButton";
import { Button } from "@/components/ui/button";
import {  Drawer,  DrawerContent,  DrawerTrigger,} from "@/components/ui/drawer";
import { socket } from "@/services/socket";
import { useUserWebRTC } from "@/hooks/user-webrtc";
import { useAppSelector } from "@/hooks/use-app-selector";
import {
  AlertDialog,  AlertDialogTrigger,  AlertDialogContent,  AlertDialogHeader,  AlertDialogTitle,
  AlertDialogDescription,  AlertDialogFooter,  AlertDialogAction,  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import VideoBox from "@/components/chat/videoBox";
import Loader from "@/components/chat/Loader";
import { useAppDispatch } from "@/hooks/user-app-dispath";
import { resetState } from "@/features/reduxStore";

const VideoChat = () => {
  const navigate = useNavigate(); 
  const dispatch = useAppDispatch();
  const roomId = useAppSelector(state => state.global.roomId); 
  const creater = useAppSelector(state => state.global.creater);
console.log("room id :",roomId , "Creater :",creater);

  const { isConnected, peerConnection, createChannel, listenChannel, sendMessage, closeConnection } = useUserWebRTC(roomId);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; time: string }[]>([]);

  const [localStream, setLocalStream] = useState<MediaStream | null>(null); 
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const [remoteMediaState, setRemoteMediaState] = useState({ mic: true, camera: true }); 
  const [isMuted, setIsMuted] = useState(false); 
  const [isCameraOff, setIsCameraOff] = useState(false);

  useEffect(() => { if (!roomId) navigate("/"); }, [roomId]); 
  useEffect(() => { if (isConnected) setStatus('connected'); }, [isConnected]);
  const handleIncomingMsg = (msg: string) => { 
    try { 
      const data = JSON.parse(msg); 
      if (data?.type === "media-state") { 
        setRemoteMediaState({ mic: data?.mic, camera: data?.camera }); 
      } else if (data?.type === "chat") { 
        setMessages(prev => [...prev, { text: data?.msg, isUser: false, time: new Date().toLocaleTimeString() }]); 
      } 
    } catch (error) { 
      console.error("Error parsing incoming message", error); 
    } 
  };

  useEffect(() => { 
    if (!peerConnection || localStream) return; 
    const startCamera = async () => { 
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true }); 
      setLocalStream(stream); 
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream)); 
      const remote = new MediaStream(); 
      setRemoteStream(remote); 
      peerConnection.ontrack = (event) => { 
        event.streams[0].getTracks().forEach(track => remote.addTrack(track)); 
      }; 
    }; 
    startCamera(); 
  }, [peerConnection]);

  useEffect(() => { 
    if (!peerConnection || !localStream) return; 
    if (creater) createChannel(handleIncomingMsg); 
    else listenChannel(handleIncomingMsg); 
    socket.once("peer_left", () => { 
      closeConnection(); 
      setStatus('disconnected'); 
    }); 
    return () => {
       console.log("Unmount VideoChat"); 
      }; 
  }, [peerConnection, localStream]);

  const handleControl = (type: 'mic' | 'camera') => { 
    if (!localStream) return; 
    const sendData = {
      type: "media-state", 
      mic: !isMuted, 
      camera: !isCameraOff 
    }
    let track;
    if (type === 'mic') { 
      track = localStream.getAudioTracks()[0]; 
      track.enabled = !track.enabled; 
      setIsMuted(!track.enabled); 
    } else { 
      track = localStream.getVideoTracks()[0]; 
      track.enabled = !track.enabled; 
      setIsCameraOff(!track.enabled); 
    } 
    sendData[type] = track.enabled;
    sendMessage(JSON.stringify(sendData)); 
  };
  const handleEndCall = () => { 
    localStream?.getTracks().forEach(t => t.stop()); 
    remoteStream?.getTracks().forEach(t => t.stop()); 
    peerConnection?.close(); 
    closeConnection(); 
    setStatus('disconnected'); 
    socket.emit("leave", true); 
  };
  const handleSendMessage = (text: string) => { 
    if (!isConnected) return; 
    sendMessage(JSON.stringify({ type: 'chat', msg: text })); 
    setMessages(prev => [
      ...prev, 
      { text, isUser: true, time: new Date().toLocaleTimeString() }
    ]); 
  };

  const findStranger = () => { dispatch(resetState()); navigate("/finding?type=video"); };
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
          <span className={`ml-2 text-xs ${status === 'connected' ? "text-green-500" :status === 'disconnected'?  "text-destructive": "text-yellow-500"}`}>
            • {status === 'connected' ? "Connected" : status === 'disconnected' ? "Disconnected" : "Connecting..."}
          </span>
        </div>
        <div className="w-10 md:w-20" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Video Section */}
        <div className="flex-1 md:flex-[7] flex flex-col p-2 md:p-4 gap-2 md:gap-4">
          {status === 'disconnected' ? (

            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 px-4">
                <p className="text-lg md:text-xl text-muted-foreground">Stranger disconnected</p>
                <Button onClick={() => findStranger()} className="h-12 px-6">
                  Find New Stranger
                </Button>
              </div>
            </div>
          ) : 
            status === 'connecting' ? (
              <div className="flex-1 flex items-center justify-center">
                <Loader  />
                <p>Connecting to stranger...</p>
                {/* message="Connecting to stranger..." */}
              </div>  
          ):
            (
            <>
              <div className="flex-1 relative">
                {/* mobile view */}
                <div className="md:hidden w-full h-full relative">
                  {/* stranger video */}
                    <VideoBox stream={remoteStream} cameraOff={!remoteMediaState.camera} micOff={!remoteMediaState.mic} user={false} />
                  {/* Self video */}
                  <div className="absolute top-2 right-2 w-24 h-32">
                    <VideoBox stream={localStream} cameraOff={isCameraOff} micOff={isMuted} user />
                  </div>
                </div>
                {/* Desktop: stacked layout */}
                <div className="hidden md:grid md:grid-rows-2 md:gap-4 md:absolute md:inset-0">
                  {/* self video */}
                  <VideoBox stream={localStream} cameraOff={isCameraOff} micOff={isMuted} user />
                  {/* stranger video */}
                  <VideoBox stream={remoteStream} cameraOff={!remoteMediaState.camera} micOff={!remoteMediaState.mic} user={false} />
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 md:gap-4 py-2 md:py-2">
                <ControlButton
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? "Unmute" : "Mute"}
                  variant={isMuted ? "active" : "default"}
                  onClick={() => handleControl('mic')}
                />
                <ControlButton
                  icon={isCameraOff ? VideoOff : Video}
                  label={isCameraOff ? "Start" : "Stop"}
                  variant={isCameraOff ? "active" : "default"}
                  onClick={() => handleControl('camera')}
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
