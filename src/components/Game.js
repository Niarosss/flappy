"use client";
import { useState, useEffect, useRef, useCallback, createRef } from "react";
import { useRouter } from "next/navigation";
import { useGameStatus } from "@/context/GameStatusContext";
import Bird from "./Bird";
import Pipe from "./Pipe";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

import {
  PauseIcon,
  PlayIcon,
  DoorIcon,
  HourglassMediumIcon,
  ArrowFatLineLeftIcon,
  ArrowsCounterClockwiseIcon,
} from "@phosphor-icons/react";
import { useTranslations } from "next-intl";

// Константи для ігрової механіки
const BIRD_SIZE_W = 38;
const BIRD_SIZE_H = 28;
const BIRD_LEFT_POSITION = 50;
const PIPE_WIDTH = 52;

const Game = ({ player }) => {
  const t = useTranslations("GamePage");
  const router = useRouter();
  const gameContainerRef = useRef(null);
  const { setIsGameActive } = useGameStatus();

  // --- Стан гри (тільки для UI/рендерингу) ---
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);
  const [difficulty, setDifficulty] = useState("medium");
  const [gameDimensions, setGameDimensions] = useState({
    width: 400,
    height: 600,
  });
  const [pipes, setPipes] = useState([]);
  const [birdStatus, setBirdStatus] = useState("playing");
  const [showDifficultyModal, setShowDifficultyModal] = useState(true);
  const [isPausedUI, setIsPausedUI] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // --- Refs (для логіки гри) ---
  const birdVelocity = useRef(0);
  const gameLoopRef = useRef(null);
  const lastPipeTime = useRef(0);
  const pipesRef = useRef([]);
  const scoreUpdatedForPipes = useRef(new Set());
  const scoreRef = useRef(0);
  const birdY = useRef(280);
  const birdDomRef = useRef(null);
  const pipeDomRefs = useRef(new Map());
  const countdownTimerRef = useRef(null);
  const isPausedRef = useRef(false);

  const GAME_WIDTH = gameDimensions.width;
  const GAME_HEIGHT = gameDimensions.height;

  useEffect(() => {
    const updateDimensions = () => {
      const container = gameContainerRef.current;
      if (container) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        setGameDimensions({
          width: windowWidth,
          height: windowHeight,
        });

        birdY.current = Math.min(windowHeight, 700) / 2 - BIRD_SIZE_H / 2;
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const difficultySettings = {
    easy: {
      gravity: 0.2,
      jump: -5,
      pipeSpeed: 3,
      pipeInterval: 1800,
      pipeGap: 160,
    },
    medium: {
      gravity: 0.3,
      jump: -6,
      pipeSpeed: 4,
      pipeInterval: 1500,
      pipeGap: 150,
    },
    hard: {
      gravity: 0.4,
      jump: -7,
      pipeSpeed: 5,
      pipeInterval: 1200,
      pipeGap: 140,
    },
  };

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  const saveOrUpdateScore = useCallback(
    async (currentScore, currentDifficulty) => {
      if (!player?.id) {
        return false;
      }
      try {
        const response = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            playerId: player.id,
            score: currentScore,
            difficulty: currentDifficulty,
          }),
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        if (!response.ok)
          throw new Error(`Server error: ${response.statusText}`);
        return true;
      } catch (error) {
        return false;
      }
    },
    [player]
  );

  const saveBestScore = useCallback(
    async (currentScore) => {
      if (currentScore > bestScore && currentScore > 0) {
        const success = await saveOrUpdateScore(currentScore, difficulty);
        if (success) {
          setBestScore(currentScore);
        }
      }
    },
    [bestScore, saveOrUpdateScore, difficulty]
  );

  const loadBestScore = useCallback(async () => {
    if (!player?.id) {
      setBestScore(0);
      return;
    }
    try {
      const response = await fetch(
        `/api/scores/?playerId=${player.id}&difficulty=${difficulty}`
      );
      await new Promise((resolve) => setTimeout(resolve, 50));
      if (!response.ok && response.status !== 404)
        throw new Error(`Server error: ${response.statusText}`);
      const data = response.status === 404 ? {} : await response.json();
      setBestScore(data?.bestScore || 0);
    } catch (error) {
      setBestScore(0);
    }
  }, [player, difficulty]);

  useEffect(() => {
    loadBestScore();
  }, [loadBestScore]);

  const checkCollision = (birdY, currentPipes) => {
    const birdRect = {
      x: BIRD_LEFT_POSITION,
      y: birdY,
      width: BIRD_SIZE_W,
      height: BIRD_SIZE_H,
    };
    for (const pipe of currentPipes) {
      const pipeTopRect = {
        x: pipe.x,
        y: 0,
        width: PIPE_WIDTH,
        height: pipe.topHeight,
      };
      const pipeBottomRect = {
        x: pipe.x,
        y: pipe.topHeight + pipe.gap,
        width: PIPE_WIDTH,
        height: GAME_HEIGHT - (pipe.topHeight + pipe.gap),
      };
      if (
        (birdRect.x < pipeTopRect.x + pipeTopRect.width &&
          birdRect.x + birdRect.width > pipeTopRect.x &&
          birdRect.y < pipeTopRect.y + pipeTopRect.height &&
          birdRect.y + birdRect.height > pipeTopRect.y) ||
        (birdRect.x < pipeBottomRect.x + pipeBottomRect.width &&
          birdRect.x + birdRect.width > pipeBottomRect.x &&
          birdRect.y < pipeBottomRect.y + pipeBottomRect.height &&
          birdRect.y + birdRect.height > pipeBottomRect.y)
      ) {
        return true;
      }
    }
    return false;
  };

  const endGame = useCallback(() => {
    if (gameLoopRef.current === null) return;
    cancelAnimationFrame(gameLoopRef.current);
    gameLoopRef.current = null;
    setGameOver(true);
    setBirdStatus("gameover");
    isPausedRef.current = false;
    setIsPausedUI(false);

    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
      setCountdown(0);
    }
    setIsGameActive(false);
    saveBestScore(scoreRef.current);
    scoreUpdatedForPipes.current.clear();
  }, [saveBestScore, setIsGameActive]);

  const gameLoop = useCallback(() => {
    if (gameLoopRef.current === null || isPausedRef.current || countdown > 0)
      return;

    const settings = difficultySettings[difficulty];
    const now = performance.now();
    let currentPipes = pipesRef.current;
    let pipesAddedOrRemoved = false;

    birdVelocity.current += settings.gravity;
    let newY = birdY.current + birdVelocity.current;
    const newRotation = Math.min(Math.max(-30, birdVelocity.current * 6), 90);

    if (newY > GAME_HEIGHT - BIRD_SIZE_H || newY < 0) {
      endGame();
      newY = Math.max(0, Math.min(newY, GAME_HEIGHT - BIRD_SIZE_H));
      birdY.current = newY;
      return;
    }
    birdY.current = newY;

    if (birdDomRef.current) {
      birdDomRef.current.style.transform = `translateY(${birdY.current}px) rotate(${newRotation}deg)`;
    }

    let updatedPipes = currentPipes
      .map((pipe) => {
        const newX = pipe.x - settings.pipeSpeed;
        const pipeRefs = pipeDomRefs.current.get(pipe.id);

        if (pipeRefs?.top.current && pipeRefs?.bottom.current) {
          const transformValue = `translateX(${newX}px)`;
          pipeRefs.top.current.style.transform = transformValue;
          pipeRefs.bottom.current.style.transform = transformValue;
        }
        return { ...pipe, x: newX };
      })
      .filter((pipe) => {
        const shouldKeep = pipe.x > -PIPE_WIDTH;
        if (!shouldKeep) {
          pipeDomRefs.current.delete(pipe.id);
          pipesAddedOrRemoved = true;
        }
        return shouldKeep;
      });

    if (now - lastPipeTime.current >= settings.pipeInterval) {
      lastPipeTime.current = now;
      const minTopHeight = 50;
      const maxTopHeight = GAME_HEIGHT - settings.pipeGap - 50;
      const topHeight =
        Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;

      const newPipe = {
        id: `pipe-${now}-${Math.random()}`,
        x: GAME_WIDTH,
        topHeight,
        gap: settings.pipeGap,
        passed: false,
      };
      updatedPipes = [...updatedPipes, newPipe];
      pipesAddedOrRemoved = true;
    }

    let scoreIncrement = 0;
    updatedPipes.forEach((pipe) => {
      if (!pipe.passed && pipe.x + PIPE_WIDTH < BIRD_LEFT_POSITION) {
        pipe.passed = true;
        if (!scoreUpdatedForPipes.current.has(pipe.id)) {
          scoreUpdatedForPipes.current.add(pipe.id);
          scoreIncrement += 1;
        }
      }
    });

    if (scoreIncrement > 0) {
      setScore((s) => s + scoreIncrement);
    }

    pipesRef.current = updatedPipes;

    if (checkCollision(birdY.current, pipesRef.current)) {
      endGame();
      return;
    }

    if (pipesAddedOrRemoved) {
      setPipes(pipesRef.current);
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [difficulty, endGame, GAME_WIDTH, GAME_HEIGHT, countdown]);

  const handleResumeGame = () => {
    if (gameOver) return;

    isPausedRef.current = false;

    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }

    setIsPausedUI(false);
    setCountdown(3);

    let currentCount = 3;
    const startCountdown = () => {
      if (currentCount > 0) {
        setCountdown(currentCount);
        currentCount -= 1;
        countdownTimerRef.current = setTimeout(startCountdown, 1000);
      } else {
        setCountdown(0);

        setTimeout(() => {
          lastPipeTime.current = performance.now();

          if (gameLoopRef.current) {
            cancelAnimationFrame(gameLoopRef.current);
          }
          gameLoopRef.current = requestAnimationFrame(gameLoop);
        }, 0);
      }
    };
    startCountdown();
  };

  const togglePause = useCallback(() => {
    if (gameOver || !gameStarted) return;

    const newPauseState = !isPausedRef.current;

    isPausedRef.current = newPauseState;
    setIsPausedUI(newPauseState);
    setIsGameActive(!newPauseState);

    if (newPauseState) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
        gameLoopRef.current = null;
      }
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
        setCountdown(0);
      }
      saveBestScore(scoreRef.current);
    } else {
      handleResumeGame();
    }
  }, [gameStarted, gameOver, saveBestScore, handleResumeGame, setIsGameActive]);

  const handleJump = useCallback(() => {
    if (showDifficultyModal || isPausedRef.current || gameOver || countdown > 0)
      return;

    if (!gameStarted) {
      setGameStarted(true);
      setShowDifficultyModal(false);
      setIsGameActive(true);

      const settings = difficultySettings[difficulty];
      lastPipeTime.current = performance.now() - settings.pipeInterval;

      birdVelocity.current = difficultySettings[difficulty].jump;
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      birdVelocity.current = difficultySettings[difficulty].jump;
    }
  }, [
    showDifficultyModal,
    gameOver,
    countdown,
    gameStarted,
    difficulty,
    gameLoop,
  ]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "Escape" &&
        gameStarted &&
        !gameOver &&
        !showDifficultyModal &&
        countdown === 0
      ) {
        togglePause();
      }

      if (
        (e.key === " " || e.key === "w" || e.key === "W") &&
        !showDifficultyModal &&
        !gameOver
      ) {
        e.preventDefault();

        if (isPausedRef.current && countdown === 0) {
          togglePause();
        } else if (!isPausedRef.current && countdown === 0) {
          handleJump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    gameStarted,
    gameOver,
    showDifficultyModal,
    togglePause,
    countdown,
    handleJump,
  ]);

  const handleRestart = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }

    birdY.current = GAME_HEIGHT / 2 - BIRD_SIZE_H / 2;
    birdVelocity.current = 0;
    pipesRef.current = [];
    pipeDomRefs.current.clear();

    setPipes([]);
    setScore(0);
    setGameOver(false);
    setGameStarted(false);
    setBirdStatus("playing");
    gameLoopRef.current = null;
    lastPipeTime.current = 0;
    scoreUpdatedForPipes.current.clear();

    loadBestScore();
    setShowDifficultyModal(true);
    isPausedRef.current = false;
    setIsPausedUI(false);
    setCountdown(0);

    setIsGameActive(false);
  };

  const handleExitToMenu = async () => {
    if (score > 0 && score > bestScore) {
      await saveBestScore(score);
    }
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
    }
    router.push("/");
  };

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
    loadBestScore();
  };

  const handleStartGameFromModal = () => {
    setShowDifficultyModal(false);
    handleJump();
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      if (countdownTimerRef.current) {
        clearTimeout(countdownTimerRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={gameContainerRef}
      className="w-screen h-screen select-none overflow-hidden"
    >
      {/* === Фіксована панель інформації === */}
      {gameStarted && !gameOver && !isPausedUI && (
        <div className="absolute md:top-6 md:left-6 top-2 left-2 z-30 flex flex-col gap-1 backdrop-blur-sm p-4 rounded-xl bg-neutral-100/20 dark:bg-neutral-600/20 border border-neutral-50/20 dark:border-neutral-600/20">
          <div
            className=" text-xl text-center"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
          >
            <span className="font-bold text-neutral-700">{score}</span>
            <span className="text-neutral-300"> | </span>
            <span className="text-green-600 font-bold">{bestScore}</span>
            <p className="text-neutral-700 capitalize text-sm">{difficulty}</p>
          </div>

          <Button variant="gray" onClick={togglePause} className="mt-1">
            <PauseIcon size={18} weight="duotone" />
          </Button>
        </div>
      )}

      {/* === Ігрове поле === */}
      <div
        className="relative cursor-pointer overflow-hidden"
        style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
        onClick={handleJump}
      >
        {pipes.map((pipe) => {
          if (!pipeDomRefs.current.has(pipe.id)) {
            pipeDomRefs.current.set(pipe.id, {
              top: createRef(),
              bottom: createRef(),
            });
          }
          const refs = pipeDomRefs.current.get(pipe.id);
          return (
            <Pipe
              key={pipe.id}
              pipeData={pipe}
              gameHeight={GAME_HEIGHT}
              ref={refs}
            />
          );
        })}
        <Bird ref={birdDomRef} birdStatus={birdStatus} />
      </div>

      {/* === Модалка зворотного відліку === */}
      {countdown > 0 && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <span className="text-7xl font-bold text-white animate-pulse text-shadow-sm">
            {countdown}
          </span>
        </div>
      )}

      {/* === Модалка паузи === */}
      {isPausedUI && gameStarted && !gameOver && countdown === 0 && (
        <Modal className="max-w-xs text-center">
          <div className="flex flex-col items-center justify-center gap-1 mb-6">
            <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-6 uppercase">
              {t("gamePaused")}
            </h2>
            <HourglassMediumIcon
              size={56}
              weight="duotone"
              className="animate-spin text-neutral-600 dark:text-neutral-300"
            />
          </div>
          <p className="text-xl mb-6 text-neutral-700 dark:text-neutral-300">
            {t("score")} <span className="font-bold">{score}</span>
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="green" onClick={handleResumeGame}>
              <PlayIcon size={24} weight="duotone" />
              {t("resume")}
            </Button>
            <Button variant="red" onClick={handleExitToMenu}>
              <DoorIcon size={24} weight="duotone" />
              {t("exit")}
            </Button>
          </div>
        </Modal>
      )}

      {/* === Модалка вибору складності === */}
      {showDifficultyModal && !gameStarted && !gameOver && (
        <Modal className="max-w-xs text-center">
          <h2 className="text-2xl font-bold mb-6">{t("selectDifficulty")}</h2>
          <div className="flex flex-col gap-3">
            {["easy", "medium", "hard"].map((level) => (
              <Button
                key={level}
                onClick={() => handleSelectDifficulty(level)}
                variant={`${difficulty === level ? "purple" : "gray"}`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </Button>
            ))}
          </div>
          <p className="mt-4 text-base text-neutral-700">
            {t("bestScore")}{" "}
            <span className="font-bold text-green-600">{bestScore}</span>
          </p>
          <div className="flex mt-4 gap-4">
            <Button
              variant="red"
              onClick={() => router.push("/")}
              className="w-[30%]"
            >
              <ArrowFatLineLeftIcon size={24} weight="duotone" />
            </Button>
            <Button
              variant="blue"
              onClick={handleStartGameFromModal}
              className="animate-pulse w-full"
            >
              <PlayIcon size={24} weight="duotone" />
              <span>{t("play")}</span>
            </Button>
          </div>
        </Modal>
      )}

      {/* === Повідомлення "Click to jump..." === */}
      {!gameStarted && !gameOver && !showDifficultyModal && (
        <div className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none">
          <p
            className="text-3xl font-extrabold text-white animate-pulse text-center p-4"
            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
          >
            {t("clickToJump")}
          </p>
        </div>
      )}

      {/* === Модалка Game Over === */}
      {gameOver && (
        <Modal className="max-w-xs text-center">
          <h2 className="text-5xl font-bold text-red-500/80 dark:text-red-500  mb-10">
            {t("gameOver")}
          </h2>
          <p className="text-xl mb-2 text-neutral-700 dark:text-neutral-300">
            {t("score")} <span className="font-bold">{score}</span>
          </p>
          <p className="text-lg mb-4 text-neutral-700 dark:text-neutral-300">
            {t("bestScore")}{" "}
            <span className="font-bold text-green-600">{bestScore}</span>
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="blue" onClick={handleRestart} className="flex-1">
              <ArrowsCounterClockwiseIcon size={24} weight="duotone" />
              {t("retry")}
            </Button>
            <Button variant="red" onClick={handleExitToMenu} className="flex-1">
              <DoorIcon size={24} weight="duotone" />
              {t("exit")}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Game;
