import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface SmartMessageSuggestionsProps {
  messages: any[];
  username: string;
  onSelectSuggestion: (message: string) => void;
  onClose: () => void;
}

const SmartMessageSuggestions: React.FC<SmartMessageSuggestionsProps> = ({
  messages,
  username,
  onSelectSuggestion,
  onClose
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [suggestedMessages, setSuggestedMessages] = useState<string[]>([]);
  
  // Basic categories for messages
  const categories = [
    { id: "love", name: "Sweet Messages", emoji: "❤️" },
    { id: "miss", name: "Missing You", emoji: "🥺" },
    { id: "flirty", name: "Flirty", emoji: "😘" },
    { id: "support", name: "Supportive", emoji: "💪" },
    { id: "goodnight", name: "Good Night", emoji: "🌙" },
    { id: "goodmorning", name: "Good Morning", emoji: "☀️" }
  ];
  
  // Base suggestions for different moods
  const baseSuggestions: Record<string, string[]> = {
    love: [
      "I love you more than words can say ❤️",
      "You mean the world to me 💖",
      "Every moment with you is precious",
      "You're the best thing that's ever happened to me",
      "I'm so lucky to have you in my life"
    ],
    miss: [
      "I miss your smile so much right now 🥺",
      "Wish you were here beside me",
      "The distance is hard, but our love is stronger",
      "Counting down until I can hold you again",
      "My arms feel empty without you"
    ],
    flirty: [
      "Just thinking about your kiss makes me blush 😘",
      "You're the hottest person I know",
      "I can't stop thinking about our last date",
      "You always look so cute in your photos",
      "I had a dream about you last night..."
    ],
    support: [
      "I believe in you! You'll do great today 💪",
      "I'm always here for you, no matter what",
      "You're stronger than you think",
      "I'm so proud of everything you do",
      "Whatever happens, we'll face it together"
    ],
    goodnight: [
      "Sweet dreams, my love 🌙",
      "I'll be dreaming of you tonight",
      "Sleep well, beautiful/handsome",
      "Can't wait to start tomorrow with your good morning text",
      "Goodnight, I love you to the moon and back"
    ],
    goodmorning: [
      "Good morning, sunshine! ☀️",
      "Hope you slept well and have an amazing day",
      "Sending you morning kisses to start your day right",
      "You're my first thought when I wake up",
      "Rise and shine, beautiful/handsome!"
    ]
  };
  
  // Analyze chat context to customize message suggestions
  useEffect(() => {
    if (!selectedCategory) return;
    
    let customizedSuggestions = [...baseSuggestions[selectedCategory]];
    
    // Get partner's name (the other user in the chat)
    const partnerMessages = messages.filter(msg => msg.sender !== username);
    let partnerName = partnerMessages.length > 0 ? partnerMessages[0].sender : "love";
    
    // Analyze time of day
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 20 || currentHour < 6;
    const isMorning = currentHour >= 6 && currentHour < 12;
    
    // Analyze chat content and context
    if (selectedCategory === "love" || selectedCategory === "flirty") {
      // Check if there have been recent messages
      const recentMessages = messages.filter(msg => {
        return Date.now() - msg.timestamp < 24 * 60 * 60 * 1000; // Last 24 hours
      });
      
      if (recentMessages.length > 5) {
        // Active conversation, can be more direct
        customizedSuggestions.push("I can't get enough of our conversations 💕");
        customizedSuggestions.push(`You make me smile every time I see your message pop up`);
      }
      
      // For personalization
      if (partnerName && partnerName !== "love") {
        customizedSuggestions.push(`${partnerName}, you're the love of my life ❤️`);
      }
    }
    
    // Time-based contextual suggestions
    if (isNight && selectedCategory !== "goodnight") {
      customizedSuggestions.push("Thinking of you before I go to sleep 💤");
    }
    
    if (isMorning && selectedCategory !== "goodmorning") {
      customizedSuggestions.push("Good morning! You're my first thought today ☀️");
    }
    
    // Check if there are image messages
    const hasSharedImages = messages.some(msg => msg.type === "image");
    if (hasSharedImages && (selectedCategory === "love" || selectedCategory === "flirty")) {
      customizedSuggestions.push("I love the photos we share - they make me feel closer to you 📸");
    }
    
    // Shuffle array to provide variety
    customizedSuggestions = customizedSuggestions.sort(() => 0.5 - Math.random());
    
    setSuggestedMessages(customizedSuggestions);
  }, [selectedCategory, messages, username]);
  
  return (
    <div className="absolute bottom-full left-0 right-0 bg-white rounded-t-2xl shadow-lg pb-4 border border-pink-100 max-h-[60vh] overflow-y-auto z-50">
      <div className="sticky top-0 bg-white p-3 border-b border-pink-100 flex justify-between items-center z-10">
        <h3 className="text-pink-500 font-semibold">
          Smart Message Suggestions
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
      
      <div className="p-3">
        {!selectedCategory ? (
          <>
            <p className="text-gray-500 text-sm mb-3 text-center">
              Choose how you're feeling
            </p>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant="outline"
                  className="flex flex-col py-4 border-pink-100 hover:bg-pink-50 hover:text-pink-600"
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <span className="text-xl mb-1">{category.emoji}</span>
                  <span className="text-sm">{category.name}</span>
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
                onClick={() => setSelectedCategory(null)}
              >
                ← Back
              </Button>
              <span className="ml-2 flex items-center font-medium">
                <span className="mr-1">
                  {categories.find(c => c.id === selectedCategory)?.emoji}
                </span>
                {categories.find(c => c.id === selectedCategory)?.name}
              </span>
            </div>
            
            <div className="space-y-2">
              {suggestedMessages.map((suggestion, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start text-left h-auto py-3 px-4 border-pink-100 hover:bg-pink-50 hover:border-pink-300"
                  onClick={() => {
                    onSelectSuggestion(suggestion);
                    onClose();
                  }}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default SmartMessageSuggestions;