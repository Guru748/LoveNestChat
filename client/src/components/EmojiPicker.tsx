import { Button } from "@/components/ui/button";

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
}

const EmojiPicker = ({ onSelectEmoji }: EmojiPickerProps) => {
  const emojis = [
    "❤️", "😘", "🥰", "😍", "💕", "💖", "💓", "💗", 
    "💘", "💝", "🐻", "🐼", "🐨", "🦊", "🦄", "👩‍❤️‍👨",
    "👩‍❤️‍💋‍👨", "🙈", "🌹", "🌸", "🌈", "🌟", "✨", "💫"
  ];
  
  return (
    <div className="absolute bottom-24 left-4 bg-white p-4 rounded-xl shadow-lg z-10 border border-[hsl(var(--secondary))] w-[90%]">
      <div className="grid grid-cols-8 gap-2">
        {emojis.map((emoji, index) => (
          <Button
            key={index}
            variant="ghost"
            className="cursor-pointer hover:bg-[hsl(var(--theme-pink-light))] p-1 rounded text-xl h-auto"
            onClick={() => onSelectEmoji(emoji)}
          >
            {emoji}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
