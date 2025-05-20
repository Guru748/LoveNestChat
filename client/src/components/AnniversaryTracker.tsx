import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Anniversary {
  id: string;
  title: string;
  date: string;
  type: string;
  emoji: string;
}

interface AnniversaryTrackerProps {
  roomCode: string;
  onClose: () => void;
  onShareAnniversary: (text: string) => void;
}

const AnniversaryTracker: React.FC<AnniversaryTrackerProps> = ({
  roomCode,
  onClose,
  onShareAnniversary
}) => {
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>("");
  const [newDate, setNewDate] = useState<string>("");
  const [newType, setNewType] = useState<string>("anniversary");
  const [newEmoji, setNewEmoji] = useState<string>("❤️");
  
  const { toast } = useToast();
  
  // Load anniversaries on mount
  useEffect(() => {
    const anniversariesKey = `bearBoo_${roomCode}_anniversaries`;
    const storedAnniversaries = localStorage.getItem(anniversariesKey);
    
    if (storedAnniversaries) {
      try {
        setAnniversaries(JSON.parse(storedAnniversaries));
      } catch (error) {
        console.error("Error loading anniversaries:", error);
      }
    }
  }, [roomCode]);
  
  // Save anniversaries to localStorage
  const saveAnniversaries = (updatedList: Anniversary[]) => {
    const anniversariesKey = `bearBoo_${roomCode}_anniversaries`;
    localStorage.setItem(anniversariesKey, JSON.stringify(updatedList));
    setAnniversaries(updatedList);
  };
  
  // Add new anniversary
  const addAnniversary = () => {
    if (!newTitle.trim() || !newDate) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and date",
        variant: "destructive"
      });
      return;
    }
    
    const newAnniversary: Anniversary = {
      id: Date.now().toString(),
      title: newTitle,
      date: newDate,
      type: newType,
      emoji: newEmoji
    };
    
    const updatedList = [...anniversaries, newAnniversary];
    saveAnniversaries(updatedList);
    
    // Reset form
    setNewTitle("");
    setNewDate("");
    setNewType("anniversary");
    setNewEmoji("❤️");
    setEditMode(false);
    
    toast({
      title: "Special date added",
      description: "Your special day has been saved!",
    });
  };
  
  // Delete anniversary
  const deleteAnniversary = (id: string) => {
    if (confirm("Are you sure you want to delete this date?")) {
      const updatedList = anniversaries.filter(a => a.id !== id);
      saveAnniversaries(updatedList);
      
      toast({
        title: "Date removed",
        description: "Your special date has been deleted",
      });
    }
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString: string) => {
    const targetDate = new Date(dateString);
    const today = new Date();
    
    // Set times to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    
    // Calculate days difference
    const differenceMs = targetDate.getTime() - today.getTime();
    const differenceDays = Math.ceil(differenceMs / (1000 * 60 * 60 * 24));
    
    // If the date has passed, calculate days since
    if (differenceDays < 0) {
      // For anniversaries, calculate next occurrence
      if (targetDate.getFullYear() < today.getFullYear()) {
        const nextAnniversary = new Date(targetDate);
        nextAnniversary.setFullYear(today.getFullYear());
        
        // If the anniversary has already occurred this year, go to next year
        if (nextAnniversary < today) {
          nextAnniversary.setFullYear(today.getFullYear() + 1);
        }
        
        const daysToNextAnniversary = Math.ceil(
          (nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        
        return { 
          type: "countdown", 
          days: daysToNextAnniversary,
          passed: false
        };
      }
      
      return { 
        type: "passed", 
        days: Math.abs(differenceDays),
        passed: true
      };
    }
    
    return { 
      type: "countdown", 
      days: differenceDays,
      passed: false
    };
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Share anniversary countdown
  const shareAnniversary = (anniversary: Anniversary) => {
    const { days, type, passed } = getDaysRemaining(anniversary.date);
    
    let message = '';
    if (type === "countdown") {
      message = `${anniversary.emoji} ${days} days until our ${anniversary.title} (${formatDate(anniversary.date)})! ${anniversary.emoji}`;
    } else {
      message = `${anniversary.emoji} It's been ${days} days since our ${anniversary.title} (${formatDate(anniversary.date)})! ${anniversary.emoji}`;
    }
    
    onShareAnniversary(message);
    onClose();
  };
  
  // Get anniversary types
  const getAnniversaryTypes = () => [
    { value: "anniversary", label: "Anniversary", emoji: "❤️" },
    { value: "first-date", label: "First Date", emoji: "🌹" },
    { value: "first-kiss", label: "First Kiss", emoji: "💋" },
    { value: "birthday", label: "Birthday", emoji: "🎂" },
    { value: "wedding", label: "Wedding", emoji: "💍" },
    { value: "trip", label: "Trip Together", emoji: "✈️" },
    { value: "milestone", label: "Milestone", emoji: "🏆" },
    { value: "custom", label: "Custom", emoji: "✨" }
  ];
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            💕 Special Dates Tracker
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
          {editMode ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 mb-4">Add Special Date</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    What are you celebrating?
                  </label>
                  <Input
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g., First Kiss, 2 Years Together"
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <Input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => {
                      setNewType(e.target.value);
                      // Set default emoji based on selected type
                      const selectedType = getAnniversaryTypes().find(t => t.value === e.target.value);
                      if (selectedType) {
                        setNewEmoji(selectedType.emoji);
                      }
                    }}
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  >
                    {getAnniversaryTypes().map(type => (
                      <option key={type.value} value={type.value}>
                        {type.emoji} {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emoji
                  </label>
                  <div className="grid grid-cols-8 gap-2 bg-pink-50 p-2 rounded-xl">
                    {["❤️", "💖", "💕", "💓", "💝", "💘", "💍", "🌹", 
                      "🎂", "🥂", "✨", "💋", "🎁", "🏆", "✈️", "🎉"].map(emoji => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setNewEmoji(emoji)}
                        className={`w-8 h-8 flex items-center justify-center rounded-full ${
                          newEmoji === emoji ? "bg-pink-200" : "hover:bg-pink-100"
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={addAnniversary}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
                  >
                    Save Date
                  </Button>
                  <Button 
                    onClick={() => setEditMode(false)}
                    className="flex-1 py-2 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center">
              <Button
                onClick={() => setEditMode(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
              >
                + Add Special Date
              </Button>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-pink-500 mb-4">Your Special Dates</h2>
          
          {anniversaries.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">💕</span>
              </div>
              <h3 className="font-semibold text-lg text-pink-500">No dates yet</h3>
              <p className="mt-2">
                Add your special moments to see countdowns and celebrate together!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {anniversaries
                .sort((a, b) => {
                  // Sort by days remaining (ascending)
                  const daysA = getDaysRemaining(a.date).days;
                  const daysB = getDaysRemaining(b.date).days;
                  const passedA = getDaysRemaining(a.date).passed;
                  const passedB = getDaysRemaining(b.date).passed;
                  
                  // Put countdowns first, then passed anniversaries
                  if (!passedA && passedB) return -1;
                  if (passedA && !passedB) return 1;
                  
                  // For countdowns, sort by days remaining (ascending)
                  // For passed dates, sort by days since (descending)
                  return passedA ? daysB - daysA : daysA - daysB;
                })
                .map(anniversary => {
                  const { days, type, passed } = getDaysRemaining(anniversary.date);
                  
                  return (
                    <Card key={anniversary.id} className="p-4 border-pink-100 hover:border-pink-200 transition-colors">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-xl">{anniversary.emoji}</span>
                            <h3 className="font-medium text-gray-800">{anniversary.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500">{formatDate(anniversary.date)}</p>
                          
                          <div className="mt-2">
                            {type === "countdown" ? (
                              <p className={`text-sm font-medium ${days <= 7 ? "text-pink-500" : "text-gray-700"}`}>
                                {days === 0 ? (
                                  "Today! 🎉"
                                ) : days === 1 ? (
                                  "Tomorrow! 🎊"
                                ) : (
                                  `${days} days to go`
                                )}
                              </p>
                            ) : (
                              <p className="text-sm text-gray-700">
                                {days === 0 ? (
                                  "Today!"
                                ) : days === 1 ? (
                                  "Yesterday"
                                ) : (
                                  `${days} days ago`
                                )}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-pink-500"
                            onClick={() => shareAnniversary(anniversary)}
                          >
                            💌
                          </Button>
                          <Button
                            variant="ghost" 
                            size="icon"
                            className="h-8 w-8 text-gray-400 hover:text-pink-500"
                            onClick={() => deleteAnniversary(anniversary.id)}
                          >
                            🗑️
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnniversaryTracker;