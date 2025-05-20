import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ScrapbookMemory {
  id: string;
  imageUrl: string;
  caption: string;
  sender: string;
  timestamp: number;
  title?: string;
}

interface ScrapbookProps {
  roomCode: string;
  username: string;
  onClose: () => void;
  onShareMemory: (memory: ScrapbookMemory) => void;
}

const Scrapbook: React.FC<ScrapbookProps> = ({
  roomCode,
  username,
  onClose,
  onShareMemory
}) => {
  const [memories, setMemories] = useState<ScrapbookMemory[]>([]);
  const [editingMemory, setEditingMemory] = useState<ScrapbookMemory | null>(null);
  const [memoryTitle, setMemoryTitle] = useState("");
  const [memoryCaption, setMemoryCaption] = useState("");
  const { toast } = useToast();

  // Load memories on mount
  useEffect(() => {
    const scrapbookKey = `bearBoo_${roomCode}_scrapbook`;
    const storedScrapbook = localStorage.getItem(scrapbookKey);
    
    if (storedScrapbook) {
      try {
        const parsedScrapbook = JSON.parse(storedScrapbook);
        setMemories(parsedScrapbook);
      } catch (error) {
        console.error("Error loading scrapbook:", error);
      }
    }
  }, [roomCode]);
  
  // Save edited memory
  const saveMemoryEdits = () => {
    if (!editingMemory) return;
    
    const updatedMemories = memories.map(memory => 
      memory.id === editingMemory.id 
        ? { 
            ...memory, 
            title: memoryTitle,
            caption: memoryCaption
          }
        : memory
    );
    
    setMemories(updatedMemories);
    
    // Save to localStorage
    const scrapbookKey = `bearBoo_${roomCode}_scrapbook`;
    localStorage.setItem(scrapbookKey, JSON.stringify(updatedMemories));
    
    // Reset state
    setEditingMemory(null);
    setMemoryTitle("");
    setMemoryCaption("");
    
    toast({
      title: "Memory updated",
      description: "Your special moment has been saved ✨",
    });
  };
  
  // Share memory
  const handleShareMemory = (memory: ScrapbookMemory) => {
    onShareMemory(memory);
    
    toast({
      title: "Memory shared",
      description: "Your memory has been shared to your chat 💖",
    });
  };
  
  // Delete memory
  const deleteMemory = (memoryId: string) => {
    if (confirm("Are you sure you want to delete this memory?")) {
      const updatedMemories = memories.filter(memory => memory.id !== memoryId);
      setMemories(updatedMemories);
      
      // Save to localStorage
      const scrapbookKey = `bearBoo_${roomCode}_scrapbook`;
      localStorage.setItem(scrapbookKey, JSON.stringify(updatedMemories));
      
      toast({
        title: "Memory deleted",
        description: "The memory has been removed from your scrapbook.",
      });
    }
  };
  
  // Edit memory
  const startEditingMemory = (memory: ScrapbookMemory) => {
    setEditingMemory(memory);
    setMemoryTitle(memory.title || "");
    setMemoryCaption(memory.caption || "");
  };
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-pink-100 bg-white rounded-t-3xl">
          <h1 className="font-bold text-pink-500">
            ✨ Digital Scrapbook
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
          {editingMemory ? (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-pink-500 mb-4">Edit Memory</h2>
              
              <div className="mb-4">
                <img 
                  src={editingMemory.imageUrl} 
                  alt="Memory" 
                  className="w-full h-auto rounded-xl"
                />
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title
                  </label>
                  <Input
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder="Give this memory a title"
                    className="w-full py-2 px-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Caption
                  </label>
                  <textarea
                    value={memoryCaption}
                    onChange={(e) => setMemoryCaption(e.target.value)}
                    placeholder="What's special about this moment?"
                    className="w-full p-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 focus:outline-none"
                    rows={3}
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={saveMemoryEdits}
                    className="flex-1 py-2 bg-pink-500 text-white rounded-xl hover:bg-pink-600 transition-all duration-200"
                  >
                    Save Changes
                  </Button>
                  <Button 
                    onClick={() => {
                      setEditingMemory(null);
                      setMemoryTitle("");
                      setMemoryCaption("");
                    }}
                    className="flex-1 py-2 bg-white border border-pink-500 text-pink-500 rounded-xl hover:bg-pink-50 transition-all duration-200"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-pink-500 mb-4">Your Memories</h2>
              
              {memories.length === 0 ? (
                <div className="text-center p-6 text-gray-500">
                  <div className="w-16 h-16 rounded-full bg-pink-100 flex items-center justify-center mb-4 mx-auto">
                    <span className="text-3xl">📷</span>
                  </div>
                  <h3 className="font-semibold text-lg text-pink-500">No memories yet</h3>
                  <p className="mt-2">
                    Your scrapbook is empty. Share photos in your chat and tap on them to add them to your scrapbook!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {memories.map((memory) => (
                    <Card key={memory.id} className="overflow-hidden group relative">
                      <div className="relative aspect-square overflow-hidden">
                        <img 
                          src={memory.imageUrl} 
                          alt={memory.title || "Memory"} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      </div>
                      <div className="p-2">
                        <h3 className="font-medium text-sm truncate">
                          {memory.title || "Memory"}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {memory.caption || "Special moment"}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 p-3">
                        <Button 
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={() => startEditingMemory(memory)}
                        >
                          ✏️ Edit
                        </Button>
                        <Button 
                          size="sm"
                          variant="secondary"
                          className="w-full text-xs"
                          onClick={() => handleShareMemory(memory)}
                        >
                          💌 Share
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          className="w-full text-xs"
                          onClick={() => deleteMemory(memory.id)}
                        >
                          🗑️ Delete
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Scrapbook;