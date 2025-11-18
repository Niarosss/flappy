// context/GameStatusContext.js
"use client";

import React, { createContext, useState, useContext, useMemo } from "react";

export const GameStatusContext = createContext({
  isGameActive: false,
  setIsGameActive: () => {},
});

export function GameStatusProvider({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);

  const value = useMemo(
    () => ({
      isGameActive,
      setIsGameActive,
    }),
    [isGameActive]
  );

  return (
    <GameStatusContext.Provider value={value}>
      {children}
    </GameStatusContext.Provider>
  );
}

export const useGameStatus = () => useContext(GameStatusContext);
