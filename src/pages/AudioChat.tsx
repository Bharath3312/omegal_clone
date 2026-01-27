import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, PhoneOff, ArrowLeft, MessageCircle } from "lucide-react";
import AudioPlaceholder from "@/components/chat/AudioPlaceholder";
import ChatPanel from "@/components/chat/ChatPanel";
import ControlButton from "@/components/chat/ControlButton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  AlertDialog,  AlertDialogTrigger,  AlertDialogContent,  AlertDialogHeader,  AlertDialogTitle,
  AlertDialogDescription,  AlertDialogFooter,  AlertDialogAction,  AlertDialogCancel,
} from "@/components/ui/alert-dialog"
import { useAppDispatch } from "@/hooks/user-app-dispath";
import { useAppSelector } from "@/hooks/use-app-selector";
import { useUserWebRTC } from "@/hooks/user-webrtc";
import { socket } from "@/services/socket";
import { resetState } from "@/features/reduxStore";
import Loader from "@/components/chat/Loader";

const AudioChat = () => {
  const navigate = useNavigate();
  const disPatch = useAppDispatch();

  const roomId = useAppSelector(state => state.global.roomId); 
  const creater = useAppSelector(state => state.global.creater);
  console.log("room id :",roomId , "Creater :",creater);

  const { isConnected, peerConnection, createChannel, listenChannel, sendMessage, closeConnection } = useUserWebRTC(roomId);
  
  const [messages, setMessages] = useState<{ text: string; isUser: boolean; time: string }[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [isMuted, setIsMuted] = useState(false);
  const [remoteIsMuted , setRemoteIsMuted] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null); 
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const handleIncomingMsg = (msg: string) => { 
    try { 
      const data = JSON.parse(msg); 
      if (data?.type === "media-state") { 
        
        setRemoteIsMuted(!data?.status); 
      } else if (data?.type === "chat") { 
        setMessages(prev => [...prev, { text: data?.msg, isUser: false, time: new Date().toLocaleTimeString() }]); 
      } 
    } catch (error) { 
      console.error("Error parsing incoming message", error); 
    } 
  };
  useEffect(() => { if (!roomId) navigate("/"); }, [roomId]); 
  useEffect(() => { if (isConnected) setStatus('connected'); }, [isConnected]);
  useEffect(() => { 
    if (!peerConnection || localStream) return; 
    const start = async () => { 
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true }); 
      setLocalStream(stream); 
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream)); 
      const remote = new MediaStream(); 
      setRemoteStream(remote); 
      peerConnection.ontrack = (event) => { 
        event.streams[0].getTracks().forEach(track => remote.addTrack(track)); 
      }; 
    }; 
    start(); 
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
  const handleEndCall = () => {
    localStream?.getTracks().forEach(t => t.stop()); 
    remoteStream?.getTracks().forEach(t => t.stop()); 
    peerConnection?.close(); 
    closeConnection(); 
    setStatus('disconnected'); 
    socket.emit("leave", true);
  };
  const handleControl = () => { 
    if (!localStream) return; 
   
    let track = localStream.getAudioTracks()[0]; 
    track.enabled = !track.enabled; 
    setIsMuted(!track.enabled); 
    

    sendMessage(JSON.stringify({
         type: "media-state", status : track.enabled
    })); 
  };
  const handleSendMessage = (text: string) => { 
    if (!isConnected) return; 
    sendMessage(JSON.stringify({ type: 'chat', msg: text })); 
    setMessages(prev => [
      ...prev, 
      { text, isUser: true, time: new Date().toLocaleTimeString() }
    ]); 
  };
  const findStranger = () => { disPatch(resetState()); navigate("/finding?type=audio"); };
  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 md:h-14 border-b border-border flex items-center px-3 md:px-4 shrink-0">
        {/* <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="px-2 md:px-3">
          <ArrowLeft className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Leave</span>
        </Button> */}
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
          <span className="text-sm font-medium text-foreground">Audio Chat</span>
          <span className={`ml-2 text-xs ${status === 'connected' ? "text-green-500" :status === 'disconnected'?  "text-destructive": "text-yellow-500" }`}>
            • {status === 'connected' ? "Connected" : status === 'disconnected' ? "Disconnected" : "Connecting..."}
          </span>
        </div>
        <div className="w-10 md:w-20" />
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Audio Section */}
        <div className="flex-1 md:flex-[7] flex flex-col p-3 md:p-4">
          {status === "disconnected" ? (

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
              {/* Audio Visualization */}
              <div className="flex-1 flex items-center justify-center">
                <AudioPlaceholder remoteStream={remoteStream} remoteIsMute={remoteIsMuted} userIsMute={isMuted} />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 md:gap-4 py-3 md:py-4">
               
                <ControlButton
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? "Unmute" : "Mute"}
                  variant={isMuted ? "active" : "default"}
                  onClick={handleControl}
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
                    <button className="md:hidden flex flex-col items-center gap-1.5 p-3 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-all duration-200 hover:scale-105 active:scale-95">
                      <MessageCircle className="w-5 h-5" />
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

export default AudioChat;
