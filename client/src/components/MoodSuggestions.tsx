import { useState } from "react";
import { Button } from "@/components/ui/button";

// Mood-based message suggestions data
const MOOD_SUGGESTIONS = {
  "love": [
    "I can't stop thinking about you ❤️", 
    "You make my heart skip a beat every time",
    "I'm so lucky to have you in my life 💕",
    "Every day with you is a blessing",
    "You're the most amazing person I've ever met",
    "I love you more than words can say",
  ],
  "miss": [
    "I miss your smile so much right now 🥺",
    "Wish you were here beside me",
    "Counting down the days until I see you again",
    "The distance is hard, but you're worth waiting for",
    "My arms feel empty without you in them",
    "I keep looking at our pictures together",
  ],
  "happy": [
    "You always know how to make me smile 😊",
    "Just thinking about you brightens my day!",
    "You're my sunshine on cloudy days",
    "I'm so happy that we found each other",
    "You bring so much joy to my life",
    "I can't help but smile when I think about us",
  ],
  "flirty": [
    "If you were here right now... 😘",
    "You look so good in that outfit I saw yesterday",
    "I had a dream about you last night...",
    "Just thinking about your kiss makes me blush",
    "You're the hottest person I know, and that's a fact",
    "Want to have a virtual date night soon?",
  ],
  "support": [
    "I believe in you! You've got this 💪",
    "I'm always here for you, no matter what",
    "You're stronger than you think",
    "I'm so proud of everything you've accomplished",
    "You inspire me every day with your determination",
    "Whatever happens, we'll face it together",
  ],
  "thankful": [
    "Thank you for always being there for me 🙏",
    "I appreciate everything you do for us",
    "You make my life so much better",
    "I'm grateful for every moment we share",
    "You're such a blessing in my life",
    "I don't know what I'd do without you",
  ]
};

interface MoodSuggestionProps {
  onSelectSuggestion: (message: string) => void;
  onClose: () => void;
}

const MoodSuggestions = ({ onSelectSuggestion, onClose }: MoodSuggestionProps) => {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const moods = Object.keys(MOOD_SUGGESTIONS);
  
  const handleSelectMood = (mood: string) => {
    setSelectedMood(mood);
  };
  
  const handleSelectSuggestion = (message: string) => {
    onSelectSuggestion(message);
    onClose();
  };
  
  const getMoodEmoji = (mood: string) => {
    switch (mood) {
      case "love": return "❤️";
      case "miss": return "🥺";
      case "happy": return "😊";
      case "flirty": return "😘";
      case "support": return "💪";
      case "thankful": return "🙏";
      default: return "💭";
    }
  };
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white rounded-t-2xl shadow-lg p-4 border border-pink-100 max-h-[60vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-pink-500 font-semibold">
          Message Suggestions
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 h-6 w-6"
        >
          ✕
        </Button>
      </div>
      
      {!selectedMood ? (
        <>
          <p className="text-gray-500 text-sm mb-3">
            Choose a mood for message suggestions
          </p>
          <div className="grid grid-cols-3 gap-2">
            {moods.map((mood) => (
              <Button
                key={mood}
                variant="outline"
                className="flex flex-col py-4 border-pink-100 hover:bg-pink-50 hover:text-pink-600"
                onClick={() => handleSelectMood(mood)}
              >
                <span className="text-xl mb-1">{getMoodEmoji(mood)}</span>
                <span className="capitalize text-sm">{mood}</span>
              </Button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center mb-3">
            <Button
              variant="ghost"
              size="sm"
              className="text-pink-500"
              onClick={() => setSelectedMood(null)}
            >
              ← Back
            </Button>
            <span className="ml-2 capitalize flex items-center">
              <span className="mr-1">{getMoodEmoji(selectedMood)}</span>
              {selectedMood} Messages
            </span>
          </div>
          
          <div className="space-y-2">
            {(MOOD_SUGGESTIONS[selectedMood as keyof typeof MOOD_SUGGESTIONS] || []).map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4 border-pink-100 hover:bg-pink-50 hover:border-pink-300"
                onClick={() => handleSelectSuggestion(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MoodSuggestions;