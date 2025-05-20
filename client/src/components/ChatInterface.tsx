import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useTheme } from "@/hooks/useTheme";
import { useChatRoom } from "@/hooks/useChatRoom";
import { useAuth } from "@/hooks/useAuth";
import ThemeSelector from "./ThemeSelector";
import EmojiPicker from "./EmojiPicker";
import MessageInput from "./MessageInput";
import MessageBubble from "./MessageBubble";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ChatInterface = () => {
  const { user, logout } = useAuth();
  const { 
    messages, 
    isTyping, 
    isPartnerOnline, 
    messageInput, 
    setMessageInput, 
    sendMessage,
    messagesEndRef 
  } = useChatRoom();
  const { currentTheme, changeTheme, themes } = useTheme();
  
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [, setLocation] = useLocation();

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const success = sendMessage(messageInput.trim());
      if (success) {
        setMessageInput("");
        setShowEmojiPicker(false);
      }
    }
  };

  const handleAddEmoji = (emoji: string) => {
    setMessageInput(messageInput + emoji);
  };

  const handleLogout = async () => {
    await logout();
    sessionStorage.removeItem("bearBooPassword");
    setLocation("/");
  };

  // Get display information
  const displayName = user?.displayName || 'Your BearBoo';
  const photoURL = user?.photoURL || '👧';
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-gradient-to-r from-[hsl(var(--theme-pink-light))] to-pink-50">
      <div className="h-[calc(100vh-2rem)] max-h-[700px] w-full max-w-md flex flex-col relative overflow-hidden bg-white/90 backdrop-blur rounded-3xl shadow-xl border border-pink-100">
        {/* Chat Header */}
        <div className="bg-[hsl(var(--primary))] text-white py-4 px-6 flex justify-between items-center rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* Profile photo with status indicator */}
              <div className="w-10 h-10 rounded-full bg-white/30 flex items-center justify-center">
                {typeof photoURL === 'string' && photoURL.startsWith('http') ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl">{photoURL}</span>
                )}
              </div>
              <div 
                className={`absolute bottom-0 right-0 w-3 h-3 ${isPartnerOnline ? 'bg-[hsl(var(--online))]' : 'bg-[hsl(var(--offline))]'} rounded-full border border-white`}
              ></div>
            </div>
            <div>
              <div className="font-semibold">{displayName} 💕</div>
              {isTyping ? (
                <div className="text-xs typing-indicator">typing</div>
              ) : (
                <div className="text-xs">{isPartnerOnline ? 'online now' : 'last seen just now'}</div>
              )}
            </div>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white hover:text-[hsl(var(--theme-pink-light))]/80 transition-colors">
                <i className="fas fa-ellipsis-v"></i>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => {
                setShowThemeSelector(!showThemeSelector);
                setShowEmojiPicker(false);
              }}>
                <i className="fas fa-palette mr-2"></i>
                Change Theme
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                <i className="fas fa-sign-out-alt mr-2"></i>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Chat Messages Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-[hsl(var(--theme-pink-light))]/10 to-white/70">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[hsl(var(--muted-foreground))]">
              <div className="w-16 h-16 rounded-full bg-[hsl(var(--theme-pink-light))]/30 flex items-center justify-center mb-4">
                <span className="text-3xl animate-heart-beat">💘</span>
              </div>
              <h3 className="font-semibold text-lg text-[hsl(var(--primary))]">No messages yet</h3>
              <p className="mt-2">
                Send your first message to start your private conversation!
              </p>
            </div>
          ) : (
            messages.map((message, index) => (
              <MessageBubble key={message.id || index} message={message} />
            ))
          )}
          
          {/* This empty div is used for auto-scrolling to the latest message */}
          <div ref={messagesEndRef} />
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
          value={messageInput}
          onChange={setMessageInput}
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
