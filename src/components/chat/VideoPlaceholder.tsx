import { User } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlaceholderProps {
  label: string;
  isUser?: boolean;
  className?: string;
}

const VideoPlaceholder = ({ label, isUser = false, className }: VideoPlaceholderProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center bg-muted/50 rounded-xl overflow-hidden",
        className
      )}
    >
      <div className="flex flex-col items-center gap-3 text-muted-foreground">
        <div className={cn(
          "w-16 h-16 rounded-full flex items-center justify-center",
          isUser ? "bg-primary/20" : "bg-secondary"
        )}>
          <User className="w-8 h-8" />
        </div>
      </div>
      
      <div className="absolute bottom-3 left-3 px-3 py-1 bg-background/80 backdrop-blur-sm rounded-md text-xs font-medium text-foreground">
        {label}
      </div>
      
      {isUser && (
        <div className="absolute top-3 right-3 w-2 h-2 bg-green-500 rounded-full animate-pulse" />
      )}
    </div>
  );
};

export default VideoPlaceholder;
