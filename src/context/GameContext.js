// context/GameStatusContext.js
"use client";

import React, {
  createContext,
  useState,
  useContext,
  useMemo,
  useEffect,
} from "react";

export const GameContext = createContext({
  isGameActive: false,
  setIsGameActive: () => {},
  soundsEnabled: true,
  toggleSound: () => {},
});

export function GameProvider({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);
  const [soundsEnabled, setSoundsEnabled] = useState(true);

  useEffect(() => {
    const savedState = localStorage.getItem("soundsEnabled");
    if (savedState !== null) {
      setSoundsEnabled(JSON.parse(savedState));
    }
  }, []);

  const toggleSound = (enabled) => {
    setSoundsEnabled(enabled);
    localStorage.setItem("soundsEnabled", JSON.stringify(enabled));
  };

  const value = useMemo(
    () => ({
      isGameActive,
      setIsGameActive,
      soundsEnabled,
      toggleSound,
    }),
    [isGameActive, soundsEnabled]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export const useGame = () => useContext(GameContext);
