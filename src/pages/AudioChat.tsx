import { useState } from "react";
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

type ConnectionStatus = "connected" | "disconnected";

const AudioChat = () => {
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("connected");

  const handleEndCall = () => {
    setStatus("disconnected");
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="h-12 md:h-14 border-b border-border flex items-center px-3 md:px-4 shrink-0">
        <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="px-2 md:px-3">
          <ArrowLeft className="w-4 h-4 md:mr-2" />
          <span className="hidden md:inline">Leave</span>
        </Button>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-foreground">Audio Chat</span>
          <span className={`ml-2 text-xs ${status === "connected" ? "text-green-500" : "text-destructive"}`}>
            • {status === "connected" ? "Connected" : "Disconnected"}
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
                <Button onClick={() => navigate("/finding?type=audio")} className="h-12 px-6">
                  Find New Stranger
                </Button>
              </div>
            </div>
          ) : (
            <>
              {/* Audio Visualization */}
              <div className="flex-1 flex items-center justify-center">
                <AudioPlaceholder />
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-3 md:gap-4 py-3 md:py-4">
                <ControlButton
                  icon={isMuted ? MicOff : Mic}
                  label={isMuted ? "Unmute" : "Mute"}
                  variant={isMuted ? "active" : "default"}
                  onClick={() => setIsMuted(!isMuted)}
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
                    <ChatPanel />
                  </DrawerContent>
                </Drawer>
              </div>
            </>
          )}
        </div>

        {/* Chat Section - Hidden on mobile */}
        <div className="hidden md:block md:flex-[3] md:min-w-[280px] md:max-w-[400px]">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
};

export default AudioChat;
