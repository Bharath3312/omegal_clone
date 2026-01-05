import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ControlButtonProps {
  icon: LucideIcon;
  label?: string;
  variant?: "default" | "destructive" | "active";
  onClick?: () => void;
}

const ControlButton = ({ icon: Icon, label, variant = "default", onClick }: ControlButtonProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 md:gap-1.5 p-3 md:p-3 rounded-xl transition-all duration-200",
        "hover:scale-105 active:scale-95 min-w-[56px] md:min-w-0",
        variant === "default" && "bg-muted hover:bg-muted/80 text-foreground",
        variant === "destructive" && "bg-destructive hover:bg-destructive/90 text-destructive-foreground",
        variant === "active" && "bg-primary hover:bg-primary/90 text-primary-foreground"
      )}
    >
      <Icon className="w-5 h-5 md:w-5 md:h-5" />
      {label && <span className="text-[10px] font-medium">{label}</span>}
    </button>
  );
};

export default ControlButton;
