import { useState, useEffect } from "react";
import { ThemeOption } from "@/types";

export function useTheme() {
  const themes: ThemeOption[] = [
    { name: "Pink", class: "theme-pink", color: "bg-pink-200" },
    { name: "Purple", class: "theme-purple", color: "bg-purple-200" },
    { name: "Blue", class: "theme-blue", color: "bg-blue-200" },
    { name: "Green", class: "theme-green", color: "bg-green-200" },
    { name: "Yellow", class: "theme-yellow", color: "bg-yellow-200" },
    { name: "Red", class: "theme-red", color: "bg-red-200" }
  ];
  
  const [currentTheme, setCurrentTheme] = useState<string>(
    localStorage.getItem("bearBooTheme") || themes[0].class
  );
  
  useEffect(() => {
    // Apply theme when component mounts or theme changes
    document.body.className = currentTheme;
    localStorage.setItem("bearBooTheme", currentTheme);
  }, [currentTheme]);
  
  const changeTheme = (themeClass: string) => {
    setCurrentTheme(themeClass);
  };
  
  return {
    currentTheme,
    changeTheme,
    themes
  };
}
