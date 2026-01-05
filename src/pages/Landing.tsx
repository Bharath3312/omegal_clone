import { Video, Headphones, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-6">
      <div className="max-w-md w-full text-center space-y-8 md:space-y-12">
        {/* Logo & Title */}
        <div className="space-y-3 md:space-y-4">
          <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-2xl bg-primary/10 flex items-center justify-center">
            <MessageCircle className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
            Anonymous Chat
          </h1>
          <p className="text-muted-foreground text-base md:text-lg px-4">
            Connect with strangers instantly. No signup required.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 md:space-y-4 px-2">
          <Button
            size="lg"
            className="w-full h-14 md:h-14 text-base md:text-lg gap-3"
            onClick={() => navigate("/finding?type=video")}
          >
            <Video className="w-5 h-5" />
            Video Chat
          </Button>
          
          <Button
            size="lg"
            variant="secondary"
            className="w-full h-14 md:h-14 text-base md:text-lg gap-3"
            onClick={() => navigate("/finding?type=audio")}
          >
            <Headphones className="w-5 h-5" />
            Audio Chat
          </Button>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground px-4">
          By using this service, you agree to our Terms of Service
        </p>
      </div>
    </div>
  );
};

export default Landing;
