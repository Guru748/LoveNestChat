import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { format } from 'date-fns';

// Expanded list of compatibility questions with categories
const COMPATIBILITY_QUESTIONS = [
  {
    question: "What's your partner's favorite food?",
    category: "Preferences"
  },
  {
    question: "What would your partner say is your most annoying habit?",
    category: "Relationship"
  },
  {
    question: "Where would your partner's dream vacation be?",
    category: "Dreams"
  },
  {
    question: "What's your partner's favorite way to relax?",
    category: "Lifestyle"
  },
  {
    question: "What movie would your partner want to watch tonight?",
    category: "Entertainment"
  },
  {
    question: "What's your partner's biggest fear?",
    category: "Personal"
  },
  {
    question: "What would your partner say is your best quality?",
    category: "Relationship"
  },
  {
    question: "What's something your partner has always wanted to try?",
    category: "Dreams"
  },
  {
    question: "What makes your partner laugh the most?",
    category: "Personality"
  },
  {
    question: "What would your partner's perfect day look like?",
    category: "Lifestyle"
  },
  {
    question: "What's a gift your partner would love but would never ask for?",
    category: "Preferences"
  },
  {
    question: "What song or artist would your partner say is 'our song'?",
    category: "Entertainment"
  },
  {
    question: "What's something your partner is secretly proud of?",
    category: "Personal"
  },
  {
    question: "What childhood memory does your partner talk about most?",
    category: "Personal"
  },
  {
    question: "What would your partner want to do on a surprise date night?",
    category: "Relationship"
  },
  {
    question: "What would your partner say is your love language?",
    category: "Relationship"
  },
  {
    question: "What's your partner's favorite way to show affection?",
    category: "Relationship"
  },
  {
    question: "What hobby would your partner take up if time and money weren't issues?",
    category: "Dreams"
  },
  {
    question: "What's a small gesture that always makes your partner happy?",
    category: "Relationship"
  },
  {
    question: "What's your partner's guilty pleasure?",
    category: "Preferences"
  },
  {
    question: "What's your partner's favorite season and why?",
    category: "Preferences"
  },
  {
    question: "What fictional character does your partner relate to most?",
    category: "Entertainment"
  },
  {
    question: "What's one thing your partner would change about their past?",
    category: "Personal"
  },
  {
    question: "What makes your partner feel most loved?",
    category: "Relationship"
  },
  {
    question: "What's your partner's idea of a perfect weekend?",
    category: "Lifestyle"
  },
  {
    question: "What style of clothing does your partner feel most confident in?",
    category: "Preferences"
  },
  {
    question: "If your partner could have dinner with anyone (dead or alive), who would it be?",
    category: "Personal"
  },
  {
    question: "What's your partner's favorite memory of your relationship?",
    category: "Relationship"
  },
  {
    question: "What does your partner value most in a friendship?",
    category: "Personal"
  },
  {
    question: "What's something that always cheers your partner up when they're sad?",
    category: "Personal"
  },
  {
    question: "What's the first thing your partner notices about other people?",
    category: "Personal"
  },
  {
    question: "What topic could your partner talk about for hours?",
    category: "Preferences"
  },
  {
    question: "What would your partner consider their greatest achievement?",
    category: "Personal"
  },
  {
    question: "What's one thing your partner wants to improve about themselves?",
    category: "Personal"
  },
  {
    question: "What does your partner find most attractive about you?",
    category: "Relationship"
  }
];

// Generate a deterministic seed based on date to ensure same questions on same day
// but different questions on different days
function getDateSeed(): number {
  const today = new Date();
  const dateString = format(today, 'yyyyMMdd');
  
  // Create a simple hash from the date string
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

// Seeded random function - returns same sequence for same seed
function seededRandom(seed: number, index: number = 0): number {
  const x = Math.sin(seed + index) * 10000;
  return x - Math.floor(x);
}

// Get today's questions (5 questions that change daily)
function getTodaysQuestions(seed: number) {
  // Create a copy of the questions
  const allQuestions = [...COMPATIBILITY_QUESTIONS];
  const todaysQuestions = [];
  
  // Pick 5 questions based on today's seed
  for (let i = 0; i < 5; i++) {
    const randomIndex = Math.floor(seededRandom(seed, i) * allQuestions.length);
    todaysQuestions.push(allQuestions[randomIndex]);
    allQuestions.splice(randomIndex, 1); // Remove the selected question
  }
  
  return todaysQuestions;
}

// Get today's date key for storage
function getTodayKey(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

// Get game title based on today's date
function getGameTitle(): string {
  const seed = getDateSeed();
  const titles = [
    "Daily Couple Connection", 
    "Today's Relationship Quiz",
    "Love Connection Challenge",
    "Daily Compatibility Test",
    "Heart Link Challenge",
    "Today's Love Language Quiz",
    "Couple's Mind Meld",
    "Daily Heart Check"
  ];
  
  return titles[Math.floor(seededRandom(seed, 42) * titles.length)];
}

interface CompatibilityGameProps {
  username: string;
  roomCode: string;
  onClose: () => void;
}

export const CompatibilityGame: React.FC<CompatibilityGameProps> = ({
  username,
  roomCode,
  onClose
}) => {
  const [gameState, setGameState] = useState<'welcome' | 'answering' | 'waiting' | 'results'>('welcome');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [myAnswers, setMyAnswers] = useState<string[]>([]);
  const [partnerAnswers, setPartnerAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [compatibility, setCompatibility] = useState(0);
  const [questions, setQuestions] = useState<typeof COMPATIBILITY_QUESTIONS>([]);
  
  const { toast } = useToast();

  // Initialize game with today's questions based on date
  useEffect(() => {
    // Get today's seed based on the date
    const seed = getDateSeed();
    
    // Get questions that are the same for today but will change tomorrow
    const todaysQuestions = getTodaysQuestions(seed);
    
    // Set the questions
    setQuestions(todaysQuestions);
  }, []);
  
  // State for game history tracking
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [todayKey] = useState(getTodayKey());

  // Load existing game data from localStorage
  useEffect(() => {
    const gameKey = `bearBoo_${roomCode}_game`;
    const historyKey = `bearBoo_${roomCode}_game_history`;
    const storedGame = localStorage.getItem(gameKey);
    const storedHistory = localStorage.getItem(historyKey);
    
    // Load game history if available
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setGameHistory(parsedHistory);
      } catch (error) {
        console.error("Error loading game history:", error);
      }
    }
    
    if (storedGame) {
      try {
        const gameData = JSON.parse(storedGame);
        
        // Check if the stored game is from a previous day
        if (gameData.dateKey && gameData.dateKey !== todayKey) {
          // It's a new day - archive yesterday's game if complete
          if (gameData.player1 && gameData.player2) {
            // Save completed game to history
            const historyEntry = {
              dateKey: gameData.dateKey,
              date: format(new Date(gameData.dateKey), 'MMM dd, yyyy'),
              title: gameData.title || "Daily Compatibility Quiz",
              player1: gameData.player1,
              player2: gameData.player2,
              questions: gameData.questions,
              compatibility: calculateCompatibility(
                gameData.player1.username === username 
                  ? gameData.player1.answers 
                  : gameData.player2.answers,
                gameData.player1.username === username 
                  ? gameData.player2.answers 
                  : gameData.player1.answers
              )
            };
            
            // Update history
            const updatedHistory = storedHistory 
              ? [historyEntry, ...JSON.parse(storedHistory)]
              : [historyEntry];
              
            // Save updated history
            localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
            setGameHistory(updatedHistory);
          }
          
          // Create a new game for today
          const newGameData = {
            dateKey: todayKey,
            title: getGameTitle(),
            questions: getTodaysQuestions(getDateSeed())
          };
          
          // Save new game
          localStorage.setItem(gameKey, JSON.stringify(newGameData));
          
          // Update state with new questions
          setQuestions(newGameData.questions);
        } 
        // If it's today's game, load it normally
        else {
          // If there's partner data and we don't have results yet
          if (gameData.player1 && gameData.player2 && gameState !== 'results') {
            // Both players have answered
            const player1Data = gameData.player1;
            const player2Data = gameData.player2;
            
            // Determine if we're player 1 or 2
            if (player1Data.username === username) {
              setMyAnswers(player1Data.answers);
              setPartnerAnswers(player2Data.answers);
              setGameState('results');
              calculateCompatibility(player1Data.answers, player2Data.answers);
            } else if (player2Data.username === username) {
              setMyAnswers(player2Data.answers);
              setPartnerAnswers(player1Data.answers);
              setGameState('results');
              calculateCompatibility(player2Data.answers, player1Data.answers);
            }
          } 
          // If only one player answered and it wasn't us
          else if (
            (gameData.player1 && gameData.player1.username !== username && !gameData.player2) ||
            (gameData.player2 && gameData.player2.username !== username && !gameData.player1)
          ) {
            setGameState('answering');
            setQuestions(gameData.questions);
          }
          // If we've already answered but partner hasn't
          else if (
            (gameData.player1 && gameData.player1.username === username && !gameData.player2) ||
            (gameData.player2 && gameData.player2.username === username && !gameData.player1)
          ) {
            setGameState('waiting');
            // Set my answers
            if (gameData.player1 && gameData.player1.username === username) {
              setMyAnswers(gameData.player1.answers);
            } else if (gameData.player2 && gameData.player2.username === username) {
              setMyAnswers(gameData.player2.answers);
            }
          }
        }
      } catch (error) {
        console.error("Error loading game data:", error);
      }
    } else {
      // No existing game, create a new one for today
      const newGameData = {
        dateKey: todayKey,
        title: getGameTitle(),
        questions: getTodaysQuestions(getDateSeed())
      };
      
      // Save new game
      localStorage.setItem(gameKey, JSON.stringify(newGameData));
      
      // Update state with new questions
      setQuestions(newGameData.questions);
    }
  }, [roomCode, username, todayKey]);
  
  // Calculate compatibility percentage
  const calculateCompatibility = (answers1: string[], answers2: string[]) => {
    // Simple algorithm - check how many answers match
    // In a real app, you might use more sophisticated comparison
    let matches = 0;
    
    for (let i = 0; i < answers1.length; i++) {
      // Check if answers are similar (case insensitive, contains similar words)
      const words1 = answers1[i].toLowerCase().split(/\s+/);
      const words2 = answers2[i].toLowerCase().split(/\s+/);
      
      // Check for word overlap
      const commonWords = words1.filter(word => 
        words2.some(w2 => w2.includes(word) || word.includes(w2))
      );
      
      if (commonWords.length > 0) {
        matches++;
      }
    }
    
    const score = Math.round((matches / answers1.length) * 100);
    setCompatibility(score);
  };
  
  // Submit the current answer and move to next question
  const submitAnswer = () => {
    if (!currentAnswer.trim()) {
      toast({
        title: "Please enter an answer",
        description: "Don't leave it blank! 💕",
        variant: "destructive",
      });
      return;
    }
    
    const updatedAnswers = [...myAnswers, currentAnswer];
    setMyAnswers(updatedAnswers);
    setCurrentAnswer("");
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // All questions answered
      finishGame(updatedAnswers);
    }
  };
  
  // Save game results to localStorage
  const finishGame = (answers: string[]) => {
    const gameKey = `bearBoo_${roomCode}_game`;
    const storedGame = localStorage.getItem(gameKey);
    let gameData: any = storedGame ? JSON.parse(storedGame) : { 
      dateKey: todayKey,
      title: getGameTitle(),
      questions 
    };
    
    // Save my answers
    const playerData = {
      username,
      answers
    };
    
    // Determine if I'm player 1 or 2
    if (!gameData.player1) {
      gameData.player1 = playerData;
    } else if (gameData.player1.username !== username && !gameData.player2) {
      gameData.player2 = playerData;
    } else if (gameData.player1.username === username) {
      gameData.player1 = playerData;
    } else {
      gameData.player2 = playerData;
    }
    
    // Save to localStorage
    localStorage.setItem(gameKey, JSON.stringify(gameData));
    
    // Check if both players have answered
    if (gameData.player1 && gameData.player2) {
      setPartnerAnswers(
        gameData.player1.username === username 
          ? gameData.player2.answers 
          : gameData.player1.answers
      );
      
      const compatibilityScore = calculateCompatibility(
        gameData.player1.username === username 
          ? gameData.player1.answers 
          : gameData.player2.answers,
        gameData.player1.username === username 
          ? gameData.player2.answers 
          : gameData.player1.answers
      );
      
      // If game is complete (both players answered), save to history
      const historyKey = `bearBoo_${roomCode}_game_history`;
      const storedHistory = localStorage.getItem(historyKey);
      
      // Create history entry
      const historyEntry = {
        dateKey: gameData.dateKey || todayKey,
        date: format(new Date(gameData.dateKey || todayKey), 'MMM dd, yyyy'),
        title: gameData.title || "Daily Compatibility Quiz",
        player1: gameData.player1,
        player2: gameData.player2,
        questions: questions,
        compatibility: compatibilityScore
      };
      
      // Save to history if we don't already have an entry for today
      const parsedHistory = storedHistory ? JSON.parse(storedHistory) : [];
      const todayEntryExists = parsedHistory.some((entry: any) => entry.dateKey === todayKey);
      
      if (!todayEntryExists) {
        const updatedHistory = [historyEntry, ...parsedHistory];
        localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
        setGameHistory(updatedHistory);
      }
      
      setGameState('results');
    } else {
      setGameState('waiting');
    }
  };
  
  // Start a new game (reset everything)
  const startNewGame = () => {
    // Clear old game data
    const gameKey = `bearBoo_${roomCode}_game`;
    
    // Generate new game with today's questions
    const newGameData = {
      dateKey: todayKey,
      title: getGameTitle(),
      questions: getTodaysQuestions(getDateSeed())
    };
    
    // Save new game data
    localStorage.setItem(gameKey, JSON.stringify(newGameData));
    
    // Reset state
    setMyAnswers([]);
    setPartnerAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setGameState('answering');
    setQuestions(newGameData.questions);
    setShowHistory(false);
  };
  
  // Toggle history view
  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };
  
  // Render different views based on game state and whether history is being shown
  const renderContent = () => {
    // If showing history, render history view instead of game state
    if (showHistory) {
      return (
        <div className="p-4">
          <h2 className="text-2xl font-bold text-center text-pink-500 mb-4">
            Compatibility History
          </h2>
          <p className="text-center text-sm mb-6">
            Track how well you and your partner match across different days
          </p>
          
          {gameHistory.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {gameHistory.map((entry, index) => (
                <Card key={index} className="border-pink-100 p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-bold text-pink-500">{entry.title}</h3>
                    <div className="text-sm text-gray-500">{entry.date}</div>
                  </div>
                  
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-sm">Compatibility:</div>
                      <div 
                        className={`font-bold ${
                          entry.compatibility >= 80 ? 'text-green-500' : 
                          entry.compatibility >= 60 ? 'text-green-400' : 
                          entry.compatibility >= 40 ? 'text-yellow-500' : 
                          'text-pink-500'
                        }`}
                      >
                        {entry.compatibility}%
                      </div>
                    </div>
                    
                    <div className="w-full bg-pink-100 rounded-full h-2 mt-1">
                      <div 
                        className={`h-2 rounded-full ${
                          entry.compatibility >= 80 ? 'bg-green-500' : 
                          entry.compatibility >= 60 ? 'bg-green-400' : 
                          entry.compatibility >= 40 ? 'bg-yellow-500' : 
                          'bg-pink-500'
                        }`}
                        style={{ width: `${entry.compatibility}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm mb-2 font-medium text-pink-500">
                    Top Questions:
                  </div>
                  
                  {entry.questions.slice(0, 3).map((q: any, qIndex: number) => (
                    <div key={qIndex} className="border-t border-pink-100 pt-2 pb-2">
                      <div className="font-medium text-sm mb-1">{q.question}</div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <div className="text-xs text-pink-400">You:</div>
                          <div className="bg-pink-50 p-1 rounded text-xs">
                            {entry.player1.username === username 
                              ? entry.player1.answers[qIndex]
                              : entry.player2.answers[qIndex]
                            }
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-pink-400">Partner:</div>
                          <div className="bg-pink-50 p-1 rounded text-xs">
                            {entry.player1.username === username 
                              ? entry.player2.answers[qIndex]
                              : entry.player1.answers[qIndex]
                            }
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {entry.questions.length > 3 && (
                    <div className="text-xs text-center text-pink-400 mt-2">
                      + {entry.questions.length - 3} more questions
                    </div>
                  )}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8">
              <div className="text-4xl mb-4">💖</div>
              <p>No game history yet! Complete today's quiz to start building your history.</p>
            </div>
          )}
          
          <div className="flex gap-3 mt-6">
            <Button 
              onClick={toggleHistory}
              className="flex-1 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              Back to Today's Game
            </Button>
            <Button 
              onClick={onClose}
              className="flex-1 py-3 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
            >
              Return to Chat
            </Button>
          </div>
        </div>
      );
    }
    
    // Otherwise, render based on game state
    switch (gameState) {
      case 'welcome':
        return (
          <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-pink-500 mb-4">
              {getGameTitle()} 
              <div className="text-sm font-normal mt-1">{format(new Date(), 'MMMM d, yyyy')}</div>
            </h2>
            <p className="mb-6">
              Find out how well you know each other! Answer 5 questions about your partner,
              and they'll do the same. The more similar your answers, the higher your compatibility score!
            </p>
            
            {gameHistory.length > 0 && (
              <div className="mb-6 bg-pink-50 p-3 rounded-xl">
                <div className="text-sm font-medium text-pink-500 mb-2">Previous Compatibility:</div>
                <div className="flex justify-between items-center">
                  <span>Last Score: </span>
                  <span className="font-bold text-pink-600">{gameHistory[0]?.compatibility}%</span>
                </div>
                <Button 
                  onClick={toggleHistory}
                  variant="ghost" 
                  className="w-full mt-2 text-pink-500 hover:bg-pink-100"
                >
                  View History
                </Button>
              </div>
            )}
            
            <Button 
              onClick={() => setGameState('answering')}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              Start Today's Quiz
            </Button>
          </div>
        );
        
      case 'answering':
        return (
          <div className="p-4">
            <div className="mb-2 flex justify-between items-center">
              <h2 className="text-xl font-bold text-pink-500">
                Today's Quiz
              </h2>
              <div className="text-sm text-pink-400">
                {format(new Date(), 'MMM d')}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="flex space-x-1 mb-4">
              {questions.map((_, index) => (
                <div 
                  key={index}
                  className={`h-1.5 flex-1 rounded-full ${
                    index < currentQuestionIndex ? 'bg-pink-500' :
                    index === currentQuestionIndex ? 'bg-pink-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="text-sm font-medium text-gray-500 mb-1">
              Question {currentQuestionIndex + 1} of {questions.length}
            </div>
            
            <div className="bg-pink-50 rounded-xl p-4 mb-6">
              <p className="font-medium text-gray-800">
                {questions[currentQuestionIndex]?.question}
              </p>
              <div className="mt-2 text-xs text-pink-400">
                Category: {questions[currentQuestionIndex]?.category}
              </div>
            </div>
            
            <textarea
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none mb-4"
              rows={3}
            />
            
            <Button 
              onClick={submitAnswer}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Game"}
            </Button>
            
            {gameHistory.length > 0 && (
              <Button 
                onClick={toggleHistory}
                variant="link" 
                className="w-full mt-2 text-pink-500"
              >
                View Previous Results
              </Button>
            )}
          </div>
        );
        
      case 'waiting':
        return (
          <div className="text-center p-4">
            <div className="animate-bounce mb-6">
              <span className="text-5xl">💕</span>
            </div>
            <h2 className="text-2xl font-bold text-pink-500 mb-4">
              Waiting for your partner...
            </h2>
            <p className="mb-6">
              You've completed today's questions! Now waiting for your partner to finish.
              Check back later to see your compatibility results!
            </p>
            
            {gameHistory.length > 0 && (
              <Button 
                onClick={toggleHistory}
                className="w-full py-3 mb-4 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
              >
                View Previous Results
              </Button>
            )}
            
            <Button 
              onClick={onClose}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              Return to Chat
            </Button>
          </div>
        );
        
      case 'results':
        return (
          <div className="p-4">
            <h2 className="text-2xl font-bold text-center text-pink-500 mb-2">
              Today's Compatibility Score
            </h2>
            <div className="text-center text-sm text-pink-400 mb-4">
              {format(new Date(), 'MMMM d, yyyy')}
            </div>
            
            <div className="text-center text-3xl font-bold mb-4">
              {compatibility}%
            </div>
            
            <div className="w-full bg-pink-100 rounded-full h-4 mb-6">
              <div 
                className={`h-4 rounded-full transition-all duration-1000 ${
                  compatibility >= 80 ? 'bg-green-500' : 
                  compatibility >= 60 ? 'bg-green-400' : 
                  compatibility >= 40 ? 'bg-yellow-500' : 
                  'bg-pink-500'
                }`}
                style={{ width: `${compatibility}%` }}
              ></div>
            </div>
            
            <div className="text-center mb-6">
              {compatibility >= 80 ? (
                <div>
                  <div className="text-4xl mb-2">😍</div>
                  <p className="font-medium text-green-600">Perfect Match! You two are soulmates!</p>
                </div>
              ) : compatibility >= 60 ? (
                <div>
                  <div className="text-4xl mb-2">💖</div>
                  <p className="font-medium text-green-500">Great Connection! You understand each other well!</p>
                </div>
              ) : compatibility >= 40 ? (
                <div>
                  <div className="text-4xl mb-2">💕</div>
                  <p className="font-medium text-yellow-600">Good Match! You're getting to know each other!</p>
                </div>
              ) : (
                <div>
                  <div className="text-4xl mb-2">💝</div>
                  <p className="font-medium text-pink-600">Time to learn more about each other!</p>
                </div>
              )}
            </div>
            
            <h3 className="font-bold text-pink-500 mb-3">Question Comparison:</h3>
            
            {questions.map((q, index) => (
              <Card key={index} className="mb-4 p-4 border-pink-100">
                <div className="font-medium text-gray-800 mb-2">{q.question}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-pink-400 mb-1">Your answer:</div>
                    <div className="bg-pink-50 p-2 rounded">{myAnswers[index]}</div>
                  </div>
                  <div>
                    <div className="text-xs text-pink-400 mb-1">Partner's answer:</div>
                    <div className="bg-pink-50 p-2 rounded">{partnerAnswers[index]}</div>
                  </div>
                </div>
              </Card>
            ))}
            
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={startNewGame}
                className="flex-1 py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
              >
                Play Again
              </Button>
              {gameHistory.length > 1 && (
                <Button 
                  onClick={toggleHistory}
                  className="flex-1 py-3 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
                >
                  View History
                </Button>
              )}
              <Button 
                onClick={onClose}
                className="flex-1 py-3 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
              >
                Close
              </Button>
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            {showHistory ? "💘 Compatibility History" : "💘 Daily Couple's Quiz"}
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
        
        {renderContent()}
      </div>
    </div>
  );
};

export default CompatibilityGame;