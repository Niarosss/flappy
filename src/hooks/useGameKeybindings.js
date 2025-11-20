import { useKeybinding } from "./useKeybinding";
import { useCallback } from "react";

export const useGameKeybindings = ({
  uiState,
  onJump,
  onPause,
  onResume,
  onRestart,
  onExit,
  difficulty,
  setDifficulty,
  onStartGame,
}) => {
  const difficulties = ["easy", "medium", "hard"];

  // Логіка для навігації по складності ---
  const handleDifficultyChange = useCallback(
    (direction) => {
      const currentIndex = difficulties.indexOf(difficulty);
      let nextIndex;
      if (direction === "down") {
        nextIndex = (currentIndex + 1) % difficulties.length;
      } else {
        nextIndex =
          (currentIndex - 1 + difficulties.length) % difficulties.length;
      }
      setDifficulty(difficulties[nextIndex]);
    },
    [difficulty, setDifficulty]
  );

  // Клавіші для екрану вибору складності
  useKeybinding(
    ["ArrowDown", "s", "S", "і", "І"],
    () => handleDifficultyChange("down"),
    {
      active: uiState === "difficulty",
    }
  );
  useKeybinding(
    ["ArrowUp", "w", "W", "ц", "Ц"],
    () => handleDifficultyChange("up"),
    {
      active: uiState === "difficulty",
    }
  );
  useKeybinding(["Enter", "E", "e", " ", "У", "у"], onStartGame, {
    active: uiState === "difficulty",
  });

  // Клавіші для стрибка
  useKeybinding([" ", "w", "W", "ц", "Ц"], onJump, {
    // ЗМІНЕНО: Дозволяємо стрибати і для старту гри, і під час гри
    active: uiState === "playing" || uiState === "ready",
  });

  // Клавіша паузи
  useKeybinding("Escape", onPause, {
    active: uiState === "playing",
  });

  // Клавіші для модального вікна паузи
  useKeybinding(["Enter", " ", " E ", "e", "У", "у"], onResume, {
    active: uiState === "paused",
  });
  useKeybinding("Escape", onExit, {
    active: uiState === "paused",
  });

  // Клавіші для модального вікна Game Over
  useKeybinding(["Enter", " ", " E ", "e", "У", "у"], onRestart, {
    active: uiState === "gameOver",
  });
  useKeybinding("Escape", onExit, {
    active: uiState === "gameOver",
  });
};
