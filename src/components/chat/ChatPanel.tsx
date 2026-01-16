import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";
import { useState } from "react";

const mockMessages = [
  { id: 1, message: "Hey there! 👋", isUser: false, timestamp: "2:34 PM" },
  { id: 2, message: "Hi! How are you?", isUser: true, timestamp: "2:34 PM" },
  { id: 3, message: "I'm doing great, thanks for asking!", isUser: false, timestamp: "2:35 PM" },
  { id: 4, message: "That's awesome to hear!", isUser: true, timestamp: "2:35 PM" },
];

const ChatPanel = ({ messages, onSend }) => {
   const [text, setText] = useState("")
  return (
    <div className="flex flex-col h-full bg-card md:border-l border-border">
      <div className="p-3 md:p-4 border-b border-border">
        <h3 className="font-semibold text-foreground">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
        {messages.map((msg,i) => (
          <ChatMessage
            key={i}
            message={msg.text}
            isUser={msg.isUser}
            timestamp={msg.time}
          />
        ))}
      </div>
      
      <div className="p-3 md:p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && text.length) {
                e.preventDefault();
                onSend(text);
                setText("");
              }
            }}
            placeholder="Type a message..."
            className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary h-11 md:h-10"
          />
          <Button size="icon" className="shrink-0 h-11 w-11 md:h-10 md:w-10"
          disabled={!text.length}
           onClick={()=>{
            onSend(text);
            setText("");}}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatPanel;
