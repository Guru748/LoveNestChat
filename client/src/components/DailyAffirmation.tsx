import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

// Collection of love affirmations
const LOVE_AFFIRMATIONS = [
  "Every day with you makes my life more beautiful.",
  "Our love grows stronger with each passing day.",
  "Distance is just a test to see how far love can travel.",
  "You are my favorite notification.",
  "In a world full of people, my heart chose you.",
  "I fall in love with you a little more every day.",
  "You're my favorite place to go when my mind searches for peace.",
  "Meeting you was fate, becoming your friend was a choice, but falling in love with you was beyond my control.",
  "Your love is the strength that keeps me going every day.",
  "When I think about you, I realize that nothing else matters.",
  "You're the first person I want to talk to when I wake up and the last one before I go to sleep.",
  "Home is whenever I'm with you.",
  "Every love story is beautiful, but ours is my favorite.",
  "I love you more than pizza, and that's saying a lot.",
  "You're my favorite reason to lose sleep.",
  "My favorite place in the world is next to you.",
  "I want to be your favorite hello and your hardest goodbye.",
  "You make my heart smile.",
  "I choose you. And I'll choose you over and over again.",
  "The best thing to hold onto in life is each other.",
  "Being with you makes me feel like I'm living in a dream.",
  "You're my today and all of my tomorrows.",
  "I never want to stop making memories with you.",
  "You are my happy place.",
  "Thinking of you keeps me awake. Dreaming of you keeps me asleep. Being with you keeps me alive.",
  "Your love is the sunshine of my life.",
  "I know I'm in love with you because I don't want anyone else.",
  "There is no remedy for love but to love more.",
  "I'm wearing the smile you gave me.",
  "Your voice is my favorite sound."
];

interface DailyAffirmationProps {
  roomCode: string;
  onClose: () => void;
  onSendAffirmation: (text: string) => void;
}

const DailyAffirmation: React.FC<DailyAffirmationProps> = ({
  roomCode,
  onClose,
  onSendAffirmation
}) => {
  const [dailyAffirmation, setDailyAffirmation] = useState<string>("");
  const [affirmationHistory, setAffirmationHistory] = useState<{date: string, text: string}[]>([]);
  
  // Get today's date as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };
  
  // Load or generate today's affirmation
  useEffect(() => {
    const affirmationsKey = `bearBoo_${roomCode}_affirmations`;
    const storedAffirmations = localStorage.getItem(affirmationsKey);
    
    let history = [];
    if (storedAffirmations) {
      history = JSON.parse(storedAffirmations);
      setAffirmationHistory(history);
    }
    
    // Check if we already have today's affirmation
    const today = getTodayDate();
    const todaysAffirmation = history.find(a => a.date === today);
    
    if (todaysAffirmation) {
      setDailyAffirmation(todaysAffirmation.text);
    } else {
      // Generate new affirmation for today
      const randomIndex = Math.floor(Math.random() * LOVE_AFFIRMATIONS.length);
      const newAffirmation = LOVE_AFFIRMATIONS[randomIndex];
      setDailyAffirmation(newAffirmation);
      
      // Save to history
      const updatedHistory = [...history, { date: today, text: newAffirmation }];
      setAffirmationHistory(updatedHistory);
      localStorage.setItem(affirmationsKey, JSON.stringify(updatedHistory));
    }
  }, [roomCode]);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  // Send today's affirmation to chat
  const sendTodaysAffirmation = () => {
    onSendAffirmation(dailyAffirmation);
    onClose();
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            ✨ Daily Love Affirmation
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>
        
        <div className="p-4">
          <Card className="p-6 mb-6 bg-gradient-to-br from-pink-100 to-white border-pink-200">
            <div className="text-center">
              <p className="text-xs text-pink-400 mb-1">{formatDate(getTodayDate())}</p>
              <h2 className="text-xl font-bold text-pink-500 mb-4">Today's Affirmation</h2>
              <p className="text-gray-700 italic mb-4">"{dailyAffirmation}"</p>
              <Button
                onClick={sendTodaysAffirmation}
                className="w-full bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
              >
                💌 Send to Your Love
              </Button>
            </div>
          </Card>
          
          <h3 className="font-semibold text-pink-500 mb-2">Previous Affirmations</h3>
          <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
            {affirmationHistory.length > 1 ? (
              [...affirmationHistory]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(1) // Skip today's affirmation which is already displayed above
                .map((item, index) => (
                  <div key={index} className="p-3 border border-pink-100 rounded-lg">
                    <p className="text-xs text-pink-400 mb-1">{formatDate(item.date)}</p>
                    <p className="text-sm text-gray-700">"{item.text}"</p>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Your daily affirmations will appear here as they are generated each day.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyAffirmation;