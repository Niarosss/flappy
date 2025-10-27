// context/GameStatusContext.js
"use client";

import React, { createContext, useState, useContext, useMemo } from "react";

// Створення контексту зі значеннями за замовчуванням
export const GameStatusContext = createContext({
  isGameActive: false,
  setIsGameActive: () => {},
});

// Провайдер, який зберігає стан і передає його дочірнім елементам
export function GameStatusProvider({ children }) {
  const [isGameActive, setIsGameActive] = useState(false);

  // useMemo для оптимізації та стабілізації об'єкта контексту
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

// Хук для легкого використання стану в компонентах
export const useGameStatus = () => useContext(GameStatusContext);
