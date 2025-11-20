import { useRef, useCallback, useEffect } from "react";
import { createRoot } from "react-dom/client";
import Pipe from "@/components/game/Pipe";

const BIRD_SIZE_H = 28;

export const useGameLoop = ({
  gameDimensions,
  difficultySettings,
  birdLeftPosition,
  pipeWidth,
  onScoreUpdate,
  onGameOver,
  playSound,
  onCountdownUpdate,
  resolvedTheme,
}) => {
  const gameSceneRef = useRef(null);
  const birdDomRef = useRef(null);
  const pipeRootsRef = useRef(new Map());
  const gameLoopRef = useRef(null);
  const birdVelocity = useRef(0);
  const birdY = useRef(gameDimensions.height / 2);
  const pipesRef = useRef([]);
  const lastPipeTime = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const pauseTimeRef = useRef(0);
  const countdownTimerRef = useRef(0);
  const loopStateRef = useRef("running");
  const scoreUpdatedForPipes = useRef(new Set());
  const scoreRef = useRef(0);

  const checkCollision = useCallback(
    (currentBirdY, currentPipes) => {
      const birdRect = {
        x: birdLeftPosition,
        y: currentBirdY,
        width: 38,
        height: 28,
      };

      for (const pipe of currentPipes) {
        const pipeRects = [
          { x: pipe.x, y: 0, width: pipeWidth, height: pipe.topHeight },
          {
            x: pipe.x,
            y:
              gameDimensions.height -
              (gameDimensions.height - pipe.topHeight - pipe.gap),
            width: pipeWidth,
            height: gameDimensions.height - pipe.topHeight - pipe.gap,
          },
        ];

        for (const rect of pipeRects) {
          if (
            birdRect.x < rect.x + rect.width &&
            birdRect.x + birdRect.width > rect.x &&
            birdRect.y < rect.y + rect.height &&
            birdRect.y + birdRect.height > rect.y
          ) {
            return true;
          }
        }
      }
      return false;
    },
    [birdLeftPosition, pipeWidth, gameDimensions]
  );

  const stopGameLoop = useCallback(() => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
      pauseTimeRef.current = performance.now();
    }
  }, []);

  const internalGameOver = useCallback(() => {
    stopGameLoop();
    onGameOver(scoreRef.current);
  }, [stopGameLoop, onGameOver]);

  const gameLoop = useCallback(() => {
    if (!gameLoopRef.current) return;

    const settings = difficultySettings;
    const now = performance.now();
    const deltaTime = Math.min((now - lastFrameTime.current) / (1000 / 60), 3);
    lastFrameTime.current = now;

    if (loopStateRef.current === "countdown") {
      countdownTimerRef.current -= deltaTime / 60;
      const currentSecond = Math.ceil(countdownTimerRef.current);
      onCountdownUpdate(currentSecond);

      if (countdownTimerRef.current <= 0) {
        // Розраховуємо загальну тривалість паузи (включаючи відлік)
        const totalPauseDuration = performance.now() - pauseTimeRef.current;
        lastPipeTime.current += totalPauseDuration;

        loopStateRef.current = "running";
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    birdVelocity.current += settings.gravity * deltaTime;
    let newY = birdY.current + birdVelocity.current * deltaTime;
    const newRotation = Math.min(Math.max(-30, birdVelocity.current * 6), 90);

    if (newY > gameDimensions.height - BIRD_SIZE_H || newY < 0) {
      internalGameOver();
      return;
    }
    birdY.current = newY;
    if (birdDomRef.current)
      birdDomRef.current.style.transform = `translateY(${birdY.current}px) rotate(${newRotation}deg)`;

    const pipes = pipesRef.current;
    for (let i = pipes.length - 1; i >= 0; i--) {
      const pipe = pipes[i];
      pipe.x -= settings.pipeSpeed * deltaTime;

      const pipeInstance = pipeRootsRef.current.get(pipe.id);
      if (pipeInstance) {
        pipeInstance.root.render(
          <Pipe
            pipeData={pipe}
            gameHeight={gameDimensions.height}
            pipeWidth={pipeWidth}
            theme={resolvedTheme}
          />
        );
      }

      if (pipe.x < -pipeWidth) {
        if (pipeInstance) {
          pipeInstance.root.unmount();
          pipeInstance.container.remove();
          pipeRootsRef.current.delete(pipe.id);
        }
        pipes.splice(i, 1);
      }
    }

    if (now - lastPipeTime.current >= settings.pipeInterval) {
      lastPipeTime.current = now;
      const minTopHeight = 50;
      const maxTopHeight = gameDimensions.height - settings.pipeGap - 50;
      const topHeight =
        Math.random() * (maxTopHeight - minTopHeight) + minTopHeight;
      const newPipe = {
        id: `pipe-${now}`,
        x: gameDimensions.width,
        topHeight,
        gap: settings.pipeGap,
        passed: false,
      };
      pipes.push(newPipe);

      const container = document.createElement("div");
      if (gameSceneRef.current) {
        gameSceneRef.current.appendChild(container);
      }
      const root = createRoot(container);
      root.render(
        <Pipe
          pipeData={newPipe}
          gameHeight={gameDimensions.height}
          pipeWidth={pipeWidth}
          theme={resolvedTheme}
        />
      );
      pipeRootsRef.current.set(newPipe.id, { root, container });
    }

    let scoreIncrement = 0;
    pipes.forEach((pipe) => {
      if (!pipe.passed && pipe.x + pipeWidth < birdLeftPosition) {
        pipe.passed = true;
        if (!scoreUpdatedForPipes.current.has(pipe.id)) {
          scoreUpdatedForPipes.current.add(pipe.id);
          scoreIncrement += 1;
        }
      }
    });

    if (scoreIncrement > 0) {
      playSound("point");
      const newScore = scoreRef.current + scoreIncrement;
      scoreRef.current = newScore;
      onScoreUpdate(newScore);
    }

    if (checkCollision(birdY.current, pipes)) {
      internalGameOver();
      return;
    }

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [
    difficultySettings,
    gameDimensions,
    birdLeftPosition,
    pipeWidth,
    onScoreUpdate,
    playSound,
    checkCollision,
    internalGameOver,
    resolvedTheme,
    onCountdownUpdate,
  ]);

  const resumeGameLoop = useCallback(() => {
    if (gameLoopRef.current) return;

    lastFrameTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const triggerCountdown = useCallback(
    (seconds) => {
      countdownTimerRef.current = seconds;
      loopStateRef.current = "countdown";
      onCountdownUpdate(seconds);

      if (!gameLoopRef.current) {
        resumeGameLoop();
      }
    },
    [resumeGameLoop, onCountdownUpdate]
  );

  const startGame = useCallback(() => {
    if (gameLoopRef.current) return;
    loopStateRef.current = "running";
    lastFrameTime.current = performance.now();
    lastPipeTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const jump = useCallback(() => {
    birdVelocity.current = difficultySettings.jump;
  }, [difficultySettings]);

  const restartGame = useCallback(() => {
    stopGameLoop();
    loopStateRef.current = "running";
    for (const [, instance] of pipeRootsRef.current.entries()) {
      instance.root.unmount();
      instance.container.remove();
    }
    pipeRootsRef.current.clear();
    pipesRef.current = [];
    birdY.current = gameDimensions.height / 2;
    birdVelocity.current = 0;
    lastPipeTime.current = 0;
    scoreUpdatedForPipes.current.clear();
    scoreRef.current = 0;
  }, [stopGameLoop, gameDimensions]);

  useEffect(() => stopGameLoop, [stopGameLoop]);

  return {
    gameSceneRef,
    birdDomRef,
    startGame,
    stopGameLoop,
    resumeGameLoop,
    restartGame,
    jump,
    triggerCountdown,
  };
};
