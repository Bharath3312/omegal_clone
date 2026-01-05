import { User } from "lucide-react";

const AudioPlaceholder = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="relative">
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center">
          <User className="w-16 h-16 text-muted-foreground" />
        </div>
        
        {/* Audio wave animation rings */}
        <div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="absolute inset-[-8px] rounded-full border border-primary/20 animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }} />
      </div>
      
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground">Stranger</h3>
        <p className="text-sm text-muted-foreground">Connected</p>
      </div>
      
      {/* Audio wave visualization placeholder */}
      <div className="flex items-end gap-1 h-12">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="w-1 bg-primary/60 rounded-full animate-pulse"
            style={{
              height: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: '0.8s'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default AudioPlaceholder;
