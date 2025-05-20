import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface DatePlan {
  id: string;
  title: string;
  description: string;
  date: string;
  type: string;
  status: "planned" | "completed";
}

interface DateNightPlannerProps {
  roomCode: string;
  username: string;
  onClose: () => void;
  onSharePlan: (plan: DatePlan) => void;
}

const DateNightPlanner: React.FC<DateNightPlannerProps> = ({
  roomCode,
  username,
  onClose,
  onSharePlan
}) => {
  const [dateIdeas, setDateIdeas] = useState<DatePlan[]>([]);
  const [creating, setCreating] = useState<boolean>(false);
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [type, setType] = useState<string>("movie");
  
  const { toast } = useToast();
  
  // Example date night ideas
  const dateSuggestions = {
    movie: [
      "Movie marathon with synchronized watching",
      "Virtual movie night with live commentary via chat",
      "Movie night with matching snacks",
      "Watch a movie you've both been wanting to see"
    ],
    dinner: [
      "Cook the same recipe together on video call",
      "Order each other's favorite food as a surprise",
      "Virtual candlelit dinner date",
      "Make desserts together over video call"
    ],
    game: [
      "Online multiplayer games night",
      "Play truth or dare",
      "Virtual board game night",
      "Take turns solving online escape rooms"
    ],
    activity: [
      "Take a virtual museum tour together",
      "Virtual workout session together",
      "Learn a new skill together via online class",
      "Virtual book club discussion"
    ]
  };
  
  // Load date plans from localStorage
  useEffect(() => {
    const dateIdeasKey = `bearBoo_${roomCode}_dateIdeas`;
    const storedDateIdeas = localStorage.getItem(dateIdeasKey);
    
    if (storedDateIdeas) {
      try {
        setDateIdeas(JSON.parse(storedDateIdeas));
      } catch (error) {
        console.error("Error loading date ideas:", error);
      }
    }
  }, [roomCode]);
  
  // Save date plans to localStorage
  const saveDatePlans = (plans: DatePlan[]) => {
    const dateIdeasKey = `bearBoo_${roomCode}_dateIdeas`;
    localStorage.setItem(dateIdeasKey, JSON.stringify(plans));
    setDateIdeas(plans);
  };
  
  // Create new date plan
  const createDatePlan = () => {
    if (!title.trim() || !description.trim() || !date) {
      toast({
        title: "Missing information",
        description: "Please fill out all fields",
        variant: "destructive"
      });
      return;
    }
    
    const newPlan: DatePlan = {
      id: Date.now().toString(),
      title,
      description,
      date,
      type,
      status: "planned"
    };
    
    const updatedPlans = [...dateIdeas, newPlan];
    saveDatePlans(updatedPlans);
    
    // Reset form
    setTitle("");
    setDescription("");
    setDate("");
    setType("movie");
    setCreating(false);
    
    toast({
      title: "Date night planned!",
      description: "Your virtual date has been scheduled",
    });
  };
  
  // Mark date as completed
  const completeDatePlan = (id: string) => {
    const updatedPlans = dateIdeas.map(plan => 
      plan.id === id ? { ...plan, status: "completed" as const } : plan
    );
    saveDatePlans(updatedPlans);
    
    toast({
      title: "Date marked as completed",
      description: "Hope you had a wonderful time together!",
    });
  };
  
  // Delete date plan
  const deleteDatePlan = (id: string) => {
    if (confirm("Are you sure you want to delete this date plan?")) {
      const updatedPlans = dateIdeas.filter(plan => plan.id !== id);
      saveDatePlans(updatedPlans);
      
      toast({
        title: "Date plan deleted",
        description: "The date plan has been removed",
      });
    }
  };
  
  // Share date plan to chat
  const handleSharePlan = (plan: DatePlan) => {
    onSharePlan(plan);
    onClose();
  };
  
  // Handle suggestion selection
  const useSuggestion = (suggestion: string) => {
    setDescription(suggestion);
  };
  
  // Get appropriate emoji for date type
  const getTypeEmoji = (type: string) => {
    switch (type) {
      case "movie": return "🎬";
      case "dinner": return "🍽️";
      case "game": return "🎮";
      case "activity": return "🎨";
      default: return "❤️";
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };
  
  // Check if date is in the past
  const isPastDate = (dateString: string) => {
    const now = new Date();
    const planDate = new Date(dateString);
    return planDate < now;
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            🌙 Virtual Date Night Planner
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
          {creating ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 mb-4">Plan a Virtual Date</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Title
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Movie Night, Virtual Dinner"
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  >
                    <option value="movie">🎬 Movie Night</option>
                    <option value="dinner">🍽️ Dinner Date</option>
                    <option value="game">🎮 Game Night</option>
                    <option value="activity">🎨 Activity Date</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date & Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What will you do on your virtual date?"
                    className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Suggestions
                  </label>
                  <div className="bg-pink-50 p-3 rounded-xl space-y-2">
                    {dateSuggestions[type as keyof typeof dateSuggestions]?.map((suggestion, index) => (
                      <button
                        key={index}
                        onClick={() => useSuggestion(suggestion)}
                        className="w-full text-left p-2 text-sm hover:bg-pink-100 rounded-lg transition-colors"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <Button 
                    onClick={createDatePlan}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
                  >
                    Plan Date
                  </Button>
                  <Button 
                    onClick={() => setCreating(false)}
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
                onClick={() => setCreating(true)}
                className="px-4 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
              >
                + Plan a Virtual Date
              </Button>
            </div>
          )}
          
          <h2 className="text-xl font-bold text-pink-500 mb-4">Your Date Plans</h2>
          
          {dateIdeas.length === 0 ? (
            <div className="text-center p-6 text-gray-500">
              <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 mx-auto">
                <span className="text-3xl">💌</span>
              </div>
              <h3 className="font-semibold text-lg text-pink-500">No dates planned yet</h3>
              <p className="mt-2">
                Plan your first virtual date to stay connected despite the distance!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <h3 className="font-semibold text-pink-400">Upcoming Dates</h3>
              {dateIdeas
                .filter(plan => plan.status === "planned" && !isPastDate(plan.date))
                .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                .map(plan => (
                  <Card key={plan.id} className="p-4 border-pink-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-xl">{getTypeEmoji(plan.type)}</span>
                          <h3 className="font-medium text-gray-800">{plan.title}</h3>
                        </div>
                        <p className="text-xs text-pink-500 font-medium">{formatDate(plan.date)}</p>
                        <p className="text-sm text-gray-600 mt-2">{plan.description}</p>
                      </div>
                      
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-pink-500"
                          onClick={() => handleSharePlan(plan)}
                          title="Share to chat"
                        >
                          💌
                        </Button>
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-pink-500"
                          onClick={() => completeDatePlan(plan.id)}
                          title="Mark as completed"
                        >
                          ✓
                        </Button>
                        <Button
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-pink-500"
                          onClick={() => deleteDatePlan(plan.id)}
                          title="Delete"
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              
              {dateIdeas.some(plan => plan.status === "completed" || isPastDate(plan.date)) && (
                <>
                  <h3 className="font-semibold text-pink-400 mt-6">Past Dates</h3>
                  {dateIdeas
                    .filter(plan => plan.status === "completed" || isPastDate(plan.date))
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map(plan => (
                      <Card key={plan.id} className="p-4 border-gray-200 opacity-80">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="flex items-center gap-1">
                              <span className="text-xl">{getTypeEmoji(plan.type)}</span>
                              <h3 className="font-medium text-gray-600">{plan.title}</h3>
                              {plan.status === "completed" && (
                                <span className="text-xs bg-pink-100 text-pink-500 px-2 py-0.5 rounded-full">
                                  Completed
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{formatDate(plan.date)}</p>
                            <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
                          </div>
                          
                          <div>
                            <Button
                              variant="ghost" 
                              size="icon"
                              className="h-8 w-8 text-gray-400 hover:text-gray-600"
                              onClick={() => deleteDatePlan(plan.id)}
                              title="Delete"
                            >
                              🗑️
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DateNightPlanner;