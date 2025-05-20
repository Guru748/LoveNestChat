import { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onToggleEmojiPicker: () => void;
  showEmojiPicker: boolean;
}

const MessageInput = ({ value, onChange, onSend, onToggleEmojiPicker, showEmojiPicker }: MessageInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const newHeight = Math.min(textareaRef.current.scrollHeight, 120);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, [value]);
  
  const handleSendingHeart = () => {
    const sendBtn = document.getElementById('send-btn');
    if (sendBtn) {
      const heart = document.createElement('div');
      heart.className = 'absolute animate-sending-heart';
      heart.textContent = '💖';
      heart.style.position = 'absolute';
      heart.style.top = '0';
      heart.style.left = '0';
      sendBtn.appendChild(heart);
      
      setTimeout(() => heart.remove(), 1000);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
      handleSendingHeart();
    }
  };
  
  return (
    <div className="p-4 bg-white border-t border-[hsl(var(--secondary))] rounded-b-3xl">
      <div className="flex items-end gap-2">
        <Button
          type="button"
          onClick={onToggleEmojiPicker}
          variant="ghost"
          className={`text-[hsl(var(--primary))] hover:text-[hsl(var(--accent))] transition-colors p-3 ${showEmojiPicker ? 'bg-[hsl(var(--theme-pink-light))]' : ''}`}
        >
          <i className="far fa-smile text-xl"></i>
        </Button>

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            id="message"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Write something cute... ✍️💌"
            className="w-full py-3 px-4 rounded-2xl border-2 border-[hsl(var(--secondary))] focus-visible:border-[hsl(var(--primary))] focus-visible:ring-0 focus-visible:ring-offset-0 resize-none min-h-[48px] max-h-32 bg-[hsl(var(--theme-pink-light))]/50"
          />
        </div>

        <Button
          id="send-btn"
          type="button"
          onClick={() => {
            onSend();
            handleSendingHeart();
          }}
          className="bg-[hsl(var(--primary))] text-white p-3 rounded-xl hover:bg-[hsl(var(--accent))] transition-all duration-200 relative"
        >
          <i className="fas fa-paper-plane"></i>
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
