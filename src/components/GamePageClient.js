"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useGame } from "@/context/GameContext";
import { useTranslations } from "next-intl";
import { useGameAudio } from "@/hooks/useGameAudio";
import { useGameLoop } from "@/hooks/useGameLoop";
import { useGameKeybindings } from "@/hooks/useGameKeybindings";
import { useDifficultySettings } from "@/hooks/useDifficultySettings";
import { useTheme } from "next-themes";
import { AnimatePresence } from "motion/react";

import Bird from "./game/Bird";
import Pipe from "./game/Pipe";
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

const Game = ({ player, onGameOver: onGameOverProp }) => {
  const t = useTranslations("GamePage");
  const router = useRouter();
  const gameContainerRef = useRef(null);
  const { soundsEnabled, setIsGameActive } = useGame();
  const { playSound } = useGameAudio({ soundsEnabled, volume: 0.3 });
  const { resolvedTheme } = useTheme();

  const [uiState, setUiState] = useState("difficulty"); // 'difficulty', 'ready', 'playing', 'paused', 'gameOver', 'countdown'
  const [birdStatus, setBirdStatus] = useState("playing");
  const [score, setScore] = useState(0);
  const [allBestScores, setAllBestScores] = useState({
    easy: 0,
    medium: 0,
    hard: 0,
  });
  const [difficulty, setDifficulty] = useState("medium");
  const [gameDimensions, setGameDimensions] = useState({
    width: 400,
    height: 600,
  });
  const [countdown, setCountdown] = useState(0);
  const [pipes, setPipes] = useState([]);
  const pipeDomNodesRef = useRef(new Map());

  const recordScore = allBestScores[difficulty] || 0;
  const displayedBestScore = Math.max(score, recordScore);
  const gameActiveRef = useRef(false);

  const isMobile = gameDimensions.width < 768;
  const BIRD_LEFT_POSITION = isMobile ? 10 : 60;
  const PIPE_WIDTH = isMobile ? 32 : 52;

  const settings = useDifficultySettings(difficulty, isMobile);

  const onScoreUpdate = useCallback((newScore) => {
    setScore(newScore);
  }, []);

  const onGameOver = useCallback(
    (finalScore) => {
      if (!gameActiveRef.current) return;
      gameActiveRef.current = false;
      playSound("hit");
      setBirdStatus("gameover");
      setScore(finalScore);
      setUiState("gameOver");
      setIsGameActive(false);
      if (onGameOverProp && finalScore > 0)
        onGameOverProp(finalScore, difficulty);
    },
    [playSound, setIsGameActive, onGameOverProp, difficulty]
  );

  const {
    birdDomRef,
    startGame,
    stopGameLoop,
    resumeGameLoop,
    restartGame,
    jump,
    triggerCountdown,
  } = useGameLoop({
    gameDimensions,
    difficultySettings: settings,
    birdLeftPosition: BIRD_LEFT_POSITION,
    pipeWidth: PIPE_WIDTH,
    onScoreUpdate,
    onGameOver,
    playSound,
    onCountdownUpdate: setCountdown,
    onPipesUpdate: setPipes,
    pipeDomNodesRef,
  });

  const gameSceneRef = useRef(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (gameContainerRef.current) {
        setGameDimensions({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const loadAllBestScores = useCallback(async () => {
    if (!player?.id) return;
    try {
      const response = await fetch(`/api/scores/?playerId=${player.id}`);
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setAllBestScores({
        easy: data.easy || 0,
        medium: data.medium || 0,
        hard: data.hard || 0,
      });
    } catch (error) {
      console.error("Error loading scores:", error);
    }
  }, [player]);

  useEffect(() => {
    loadAllBestScores();
  }, [loadAllBestScores]);

  const handleStartGame = () => {
    setUiState("ready");
  };

  const handleJump = useCallback(
    (e) => {
      if (e) e.preventDefault();

      if (uiState !== "playing" && uiState !== "ready") return;

      if (uiState === "ready") {
        setUiState("playing");
      }

      if (!gameActiveRef.current) {
        setIsGameActive(true);
        startGame();
        gameActiveRef.current = true;
      }
      jump();
    },
    [uiState, jump, startGame, setIsGameActive]
  );

  const handlePause = useCallback(() => {
    if (uiState !== "playing") return;
    stopGameLoop();
    setUiState("paused");
    setIsGameActive(false);
  }, [uiState, stopGameLoop, setIsGameActive]);

  const handleResumeGame = useCallback(() => {
    if (uiState !== "paused") return;
    setUiState("countdown");
    triggerCountdown(3);
  }, [uiState, triggerCountdown]);

  useEffect(() => {
    if (uiState === "countdown" && countdown <= 0) {
      setUiState("playing");
      setIsGameActive(true);
    }
  }, [countdown, uiState, setIsGameActive]);

  const handleRestart = useCallback(() => {
    restartGame();
    gameActiveRef.current = false;
    setScore(0);
    setBirdStatus("playing");
    setUiState("difficulty");
    setIsGameActive(false);
    loadAllBestScores();
  }, [restartGame, setIsGameActive, loadAllBestScores]);

  const handleExitToMenu = useCallback(async () => {
    stopGameLoop();
    gameActiveRef.current = false;
    if (onGameOverProp && score > 0) await onGameOverProp(score, difficulty);
    router.push("/");
  }, [stopGameLoop, onGameOverProp, score, difficulty, router]);

  const handleSelectDifficulty = (level) => {
    setDifficulty(level);
  };

  useGameKeybindings({
    uiState,
    onJump: handleJump,
    onPause: handlePause,
    onResume: handleResumeGame,
    onRestart: handleRestart,
    onExit: handleExitToMenu,
    difficulty,
    setDifficulty,
    onStartGame: handleStartGame,
  });

  return (
    <div
      ref={gameContainerRef}
      className="w-screen h-screen select-none overflow-hidden"
    >
      {/* === Фіксована панель інформації === */}
      {uiState === "playing" && (
        <div className="absolute md:top-6 md:left-6 top-2 left-2 z-30 flex flex-col gap-1 backdrop-blur-sm p-4 rounded-xl bg-neutral-100/20 dark:bg-neutral-600/20 border border-neutral-50/20 dark:border-neutral-600/20">
          <div
            className=" text-xl text-center"
            style={{ textShadow: "1px 1px 2px rgba(0,0,0,0.5)" }}
          >
            <span className="font-bold text-neutral-700 dark:text-neutral-300">
              {score}
            </span>
            <span className="text-neutral-300"> | </span>
            <span className="text-green-600 font-bold">
              {displayedBestScore}
            </span>
            <p className="text-neutral-700 dark:text-neutral-300 capitalize text-sm">
              {difficulty}
            </p>
          </div>

          <Button variant="gray" onClick={handlePause} className="mt-1">
            <PauseIcon size={18} weight="duotone" />
          </Button>
        </div>
      )}

      {/* === Ігрове поле === */}
      <div
        ref={gameSceneRef}
        className="relative cursor-pointer overflow-hidden"
        style={{ width: gameDimensions.width, height: gameDimensions.height }}
        onPointerDown={handleJump}
      >
        {(uiState === "playing" ||
          uiState === "paused" ||
          uiState === "gameOver" ||
          uiState === "countdown") && (
          <Bird
            ref={birdDomRef}
            birdStatus={birdStatus}
            leftPosition={BIRD_LEFT_POSITION}
          />
        )}

        {/* Декларативний рендеринг труб */}
        {pipes.map((pipeData) => (
          <Pipe
            key={pipeData.id}
            ref={(node) => {
              const map = pipeDomNodesRef.current;
              if (node) {
                map.set(pipeData.id, node);
              } else {
                map.delete(pipeData.id);
              }
            }}
            pipeData={pipeData}
            gameHeight={gameDimensions.height}
            pipeWidth={PIPE_WIDTH}
            theme={resolvedTheme}
          />
        ))}
      </div>
      <AnimatePresence>
        {/* === Модалка зворотного відліку === */}
        {countdown > 0 && uiState === "countdown" && (
          <div
            key="countdown-message"
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <span className="text-7xl font-bold text-white animate-ping text-shadow-sm">
              {countdown}
            </span>
          </div>
        )}

        {/* === Модалка паузи === */}
        {uiState === "paused" && (
          <Modal key="pause-modal" className="max-w-md text-center">
            <div className="flex flex-col items-center justify-center gap-1 mb-10">
              <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-50 my-6 uppercase">
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
            <p className="text-lg mb-4 text-neutral-700 dark:text-neutral-300">
              {t("bestScore")}{" "}
              <span className="font-bold text-green-600">
                {displayedBestScore}
              </span>
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
        {uiState === "difficulty" && (
          <Modal key="difficulty-modal" className="max-w-md text-center">
            <h2 className="text-4xl font-bold my-6">{t("selectDifficulty")}</h2>
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
            <p className="mt-4 text-base text-neutral-700 dark:text-neutral-400">
              {t("bestScore")}
              <span className="font-bold text-green-600">{recordScore}</span>
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
                onClick={handleStartGame}
                className="animate-pulse w-full"
              >
                <PlayIcon size={24} weight="duotone" />
                <span>{t("play")}</span>
              </Button>
            </div>
          </Modal>
        )}

        {/* === Повідомлення "Click to jump..." === */}
        {uiState === "ready" && (
          <div
            key="ready-message"
            className="absolute inset-0 flex items-center justify-center z-40 pointer-events-none"
          >
            <p
              className="text-3xl font-extrabold text-white animate-pulse text-center p-4"
              style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}
            >
              {t("clickToJump")}
            </p>
          </div>
        )}

        {/* === Модалка Game Over === */}
        {uiState === "gameOver" && (
          <Modal key="gameover-modal" className="max-w-md text-center">
            <h2 className="text-4xl font-bold text-red-500/80 dark:text-red-500 my-10">
              {t("gameOver")}
            </h2>
            <p className="text-xl mb-2 text-neutral-700 dark:text-neutral-300">
              {t("score")} <span className="font-bold">{score}</span>
            </p>
            <p className="text-lg mb-4 text-neutral-700 dark:text-neutral-300">
              {t("bestScore")}{" "}
              <span className="font-bold text-green-600">
                {displayedBestScore}
              </span>
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="blue" onClick={handleRestart} className="flex-1">
                <ArrowsCounterClockwiseIcon size={24} weight="duotone" />
                {t("retry")}
              </Button>
              <Button
                variant="red"
                onClick={handleExitToMenu}
                className="flex-1"
              >
                <DoorIcon size={24} weight="duotone" />
                {t("exit")}
              </Button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Game;
