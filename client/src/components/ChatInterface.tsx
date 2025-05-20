import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useChat } from "@/hooks/useChat";
import { useTheme } from "@/hooks/useTheme";
import ThemeSelector from "./ThemeSelector";
import EmojiPicker from "./EmojiPicker";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";

const ChatInterface = () => {
  const { messages, sendMessage, isTyping, setTyping, isOnline } = useChat();
  const { currentTheme, changeTheme, themes } = useTheme();
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageText, setMessageText] = useState("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (messageText.trim()) {
      const success = sendMessage(messageText.trim());
      if (success) {
        setMessageText("");
        setShowEmojiPicker(false);
      }
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setMessageText(prev => prev + emoji);
  };

  const handleMessageInputChange = (value: string) => {
    setMessageText(value);
    
    // Set typing indicator when user is typing
    if (value.trim().length > 0) {
      setTyping(true);
    } else {
      setTyping(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("bearBooPassword");
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <div className="h-screen max-h-[700px] w-full max-w-md flex flex-col relative overflow-hidden bg-[hsl(var(--theme-pink-light))] rounded-3xl shadow-xl">
        {/* Chat Header */}
        <div className="bg-[hsl(var(--primary))] text-white py-4 px-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Profile photo with decorative heart */}
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                <span className="text-xl">👧</span>
              </div>
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 ${isOnline ? 'bg-[hsl(var(--online))]' : 'bg-[hsl(var(--offline))]'} rounded-full border border-white`}
              ></div>
            </div>
            <div>
              <div className="font-semibold">Your BearBoo 💕</div>
              {isTyping ? (
                <div className="text-xs typing-indicator">typing</div>
              ) : (
                <div className="text-xs">{isOnline ? 'online now' : 'last seen just now'}</div>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => {
                setShowThemeSelector(!showThemeSelector);
                setShowEmojiPicker(false);
              }}
              className="text-white hover:text-[hsl(var(--theme-pink-light))]/80 transition-colors"
            >
              <i className="fas fa-palette"></i>
            </button>
            <button 
              onClick={handleLogout}
              className="text-white hover:text-[hsl(var(--theme-pink-light))]/80 transition-colors"
            >
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>

        {/* Chat Messages Container */}
        <div 
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-[hsl(var(--theme-pink-light))]/95"
        >
          {messages.map((message, index) => (
            <MessageBubble key={message.id || index} message={message} />
          ))}
        </div>

        {/* Theme Selector */}
        {showThemeSelector && (
          <ThemeSelector 
            themes={themes} 
            currentTheme={currentTheme} 
            onSelectTheme={(themeClass) => {
              changeTheme(themeClass);
              setShowThemeSelector(false);
            }} 
          />
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <EmojiPicker onSelectEmoji={handleAddEmoji} />
        )}

        {/* Message Input */}
        <MessageInput 
          value={messageText}
          onChange={handleMessageInputChange}
          onSend={handleSendMessage}
          onToggleEmojiPicker={() => {
            setShowEmojiPicker(!showEmojiPicker);
            setShowThemeSelector(false);
          }}
          showEmojiPicker={showEmojiPicker}
        />
      </div>
    </div>
  );
};

export default ChatInterface;
