import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Loader from "@/components/chat/Loader";
import { useEffect } from "react";
import { socket } from "@/services/socket";
import { setRoomId, setCreater  } from "@/features/reduxStore";
import { useAppDispatch } from "@/hooks/user-app-dispath";

const Finding = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    console.log("use effect in fingind page");
    // socket.connect()
   socket.emit("join_queue", { type: "video" });

   socket.on('waiting',()=>{
      console.log("waiting for a match");
      dispatch(setCreater(true));
   })
   socket.on("matched", (roomId:string) => {
     dispatch(setRoomId(roomId));
     console.log("user joined",roomId);
     handleConnect();
   });

   return () => {
     socket.off("matched");
     socket.off("waiting");
   };
  }, []);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const chatType = searchParams.get("type") || "video";

  const handleConnect = () => {
    navigate(chatType === "video" ? "/video-chat" : "/audio-chat");
  };
  ////join room logic can be added here
  /// then waiting for another user to join the room
  /// perhaps stop searching button can also trigger leaving the room

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
          {/* <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => navigate("/audio-chat")}
          >
            (Demo: Skip to chat)
          </Button> */}
        </div>
      </div>
    </div>
  );
};

export default Finding;
