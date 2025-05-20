import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
  }
];

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

  // Initialize game with random questions
  useEffect(() => {
    // Shuffle and pick 5 random questions
    const shuffled = [...COMPATIBILITY_QUESTIONS].sort(() => 0.5 - Math.random());
    setQuestions(shuffled.slice(0, 5));
  }, []);
  
  // Load existing game data from localStorage
  useEffect(() => {
    const gameKey = `bearBoo_${roomCode}_game`;
    const storedGame = localStorage.getItem(gameKey);
    
    if (storedGame) {
      try {
        const gameData = JSON.parse(storedGame);
        
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
      } catch (error) {
        console.error("Error loading game data:", error);
      }
    }
  }, [roomCode, username]);
  
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
    let gameData: any = storedGame ? JSON.parse(storedGame) : { questions };
    
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
      calculateCompatibility(
        gameData.player1.username === username 
          ? gameData.player1.answers 
          : gameData.player2.answers,
        gameData.player1.username === username 
          ? gameData.player2.answers 
          : gameData.player1.answers
      );
      setGameState('results');
    } else {
      setGameState('waiting');
    }
  };
  
  // Start a new game (reset everything)
  const startNewGame = () => {
    // Clear old game data
    const gameKey = `bearBoo_${roomCode}_game`;
    localStorage.removeItem(gameKey);
    
    // Shuffle and pick 5 random questions
    const shuffled = [...COMPATIBILITY_QUESTIONS].sort(() => 0.5 - Math.random());
    const newQuestions = shuffled.slice(0, 5);
    setQuestions(newQuestions);
    
    // Save new questions to localStorage
    localStorage.setItem(gameKey, JSON.stringify({ questions: newQuestions }));
    
    // Reset state
    setMyAnswers([]);
    setPartnerAnswers([]);
    setCurrentQuestionIndex(0);
    setCurrentAnswer("");
    setGameState('answering');
  };
  
  // Render different views based on game state
  const renderContent = () => {
    switch (gameState) {
      case 'welcome':
        return (
          <div className="text-center p-4">
            <h2 className="text-2xl font-bold text-pink-500 mb-6">💘 Couple's Compatibility Game 💘</h2>
            <p className="mb-6">
              Find out how well you know each other! Answer 5 questions about your partner,
              and they'll do the same. The more similar your answers, the higher your compatibility score!
            </p>
            <Button 
              onClick={() => setGameState('answering')}
              className="w-full py-3 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
            >
              Start Game
            </Button>
          </div>
        );
        
      case 'answering':
        return (
          <div className="p-4">
            <h2 className="text-xl font-bold text-pink-500 mb-4">
              Question {currentQuestionIndex + 1} of {questions.length}
            </h2>
            
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
              You've completed all the questions! Now waiting for your partner to finish.
              Check back later to see your compatibility results!
            </p>
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
            <h2 className="text-2xl font-bold text-center text-pink-500 mb-6">
              Your Compatibility Score: {compatibility}%
            </h2>
            
            <div className="w-full bg-pink-100 rounded-full h-4 mb-6">
              <div 
                className="bg-pink-500 h-4 rounded-full transition-all duration-1000" 
                style={{ width: `${compatibility}%` }}
              ></div>
            </div>
            
            <div className="text-center mb-6">
              {compatibility >= 80 ? (
                <div>
                  <div className="text-4xl mb-2">😍</div>
                  <p className="font-medium text-pink-600">Perfect Match! You two are soulmates!</p>
                </div>
              ) : compatibility >= 60 ? (
                <div>
                  <div className="text-4xl mb-2">💖</div>
                  <p className="font-medium text-pink-600">Great Connection! You understand each other well!</p>
                </div>
              ) : compatibility >= 40 ? (
                <div>
                  <div className="text-4xl mb-2">💕</div>
                  <p className="font-medium text-pink-600">Good Match! You're getting to know each other!</p>
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
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            💘 Couple's Game
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