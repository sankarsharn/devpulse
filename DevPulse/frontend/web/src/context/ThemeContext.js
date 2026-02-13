"use client";
import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem("devpulse_settings_v1");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.preferences?.darkMode !== undefined) {
        setIsDarkMode(parsed.preferences.darkMode);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    
    // Sync to local storage so Settings.jsx sees it
    const raw = localStorage.getItem("devpulse_settings_v1");
    const settings = raw ? JSON.parse(raw) : { preferences: {} };
    settings.preferences.darkMode = isDarkMode;
    localStorage.setItem("devpulse_settings_v1", JSON.stringify(settings));
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode, toggleTheme: () => setIsDarkMode(!isDarkMode) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);