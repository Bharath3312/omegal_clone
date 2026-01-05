import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Loader from "@/components/chat/Loader";

const Finding = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "video";

  const handleConnect = () => {
    navigate(chatType === "video" ? "/video-chat" : "/audio-chat");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full text-center space-y-8 md:space-y-10">
        <Loader />
        
        <div className="space-y-2 px-4">
          <h2 className="text-xl md:text-2xl font-semibold text-foreground">
            Finding a stranger to chat with...
          </h2>
          <p className="text-sm md:text-base text-muted-foreground">
            Please wait while we connect you
          </p>
        </div>

        <div className="flex flex-col gap-3 px-2">
          <Button
            variant="outline"
            size="lg"
            className="gap-2 h-12 md:h-11"
            onClick={() => navigate("/")}
          >
            <X className="w-4 h-4" />
            Stop Searching
          </Button>
          
          {/* Demo button to simulate connection */}
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={handleConnect}
          >
            (Demo: Skip to chat)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Finding;
