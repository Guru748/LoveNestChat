import { Message } from "@/types";
import { formatDistance } from "date-fns";

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { text, sender, timestamp, read } = message;
  
  // Format the timestamp to a relative time
  const formattedTime = formatDistance(new Date(timestamp), new Date(), { 
    addSuffix: true,
    includeSeconds: true
  });
  
  // Style based on sender
  const containerClasses = sender === "me" 
    ? "flex justify-end animate-slide-in" 
    : "flex justify-start animate-slide-in";
  
  const bubbleClasses = sender === "me"
    ? "bg-[hsl(var(--primary))] text-white rounded-tl-2xl rounded-bl-2xl rounded-tr-2xl"
    : "bg-white text-[hsl(var(--theme-pink-dark))] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl";
  
  return (
    <div className={containerClasses}>
      <div className="max-w-[80%]">
        <div className={`${bubbleClasses} p-3 shadow-sm`}>
          <p>{text}</p>
          <div className={`text-xs opacity-70 flex items-center ${sender === "me" ? "justify-end" : ""}`}>
            {formattedTime}
            {sender === "me" && (
              <span className="ml-1 text-xs">
                {read ? (
                  <i className="fas fa-check-double text-blue-400"></i>
                ) : (
                  <i className="fas fa-check"></i>
                )}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
