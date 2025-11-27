import { useRef, useCallback, useEffect } from "react";

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
  onPipesUpdate,
  pipeDomNodesRef,
}) => {
  const birdDomRef = useRef(null);
  const gameLoopRef = useRef(null);
  const birdVelocity = useRef(0);
  const birdY = useRef(gameDimensions.height / 2);
  const pipesRef = useRef([]);
  const lastPipeTime = useRef(0);
  const lastFrameTime = useRef(performance.now());
  const pauseTimeRef = useRef(0);
  const countdownEndTimeRef = useRef(0);
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

  const gameLoop = useCallback(() => {
    if (!gameLoopRef.current) return;

    const settings = difficultySettings;
    const now = performance.now();
    const deltaTime = Math.min((now - lastFrameTime.current) / (1000 / 60), 3);
    lastFrameTime.current = now;

    if (loopStateRef.current === "countdown") {
      const remainingTime = Math.max(0, countdownEndTimeRef.current - now);
      const currentSecond = Math.ceil(remainingTime / 1000);
      onCountdownUpdate(currentSecond);

      if (remainingTime <= 0) {
        onCountdownUpdate(0);
        loopStateRef.current = "running";

        if (pauseTimeRef.current > 0) {
          const pauseDuration = performance.now() - pauseTimeRef.current;
          lastPipeTime.current += pauseDuration;
          pauseTimeRef.current = 0;
        }
      }

      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    birdVelocity.current += settings.gravity * deltaTime;
    let newY = birdY.current + birdVelocity.current * deltaTime;
    const newRotation = Math.min(Math.max(-30, birdVelocity.current * 6), 90);

    if (newY > gameDimensions.height - BIRD_SIZE_H || newY < 0) {
      stopGameLoop();
      onGameOver(scoreRef.current);
      return;
    }
    birdY.current = newY;
    if (birdDomRef.current)
      birdDomRef.current.style.transform = `translateY(${birdY.current}px) rotate(${newRotation}deg)`;

    // --- Логіка труб ---
    const pipes = pipesRef.current;
    const pipesToRemove = [];

    for (const pipe of pipes) {
      pipe.x -= difficultySettings.pipeSpeed * deltaTime;

      const pipeNode = pipeDomNodesRef.current.get(pipe.id);
      if (pipeNode) {
        pipeNode.style.transform = `translateX(${pipe.x}px)`;
      }

      if (pipe.x < -pipeWidth) {
        pipesToRemove.push(pipe.id);
      }
    }

    let pipesUpdated = false;

    if (pipesToRemove.length > 0) {
      pipesRef.current = pipes.filter((p) => !pipesToRemove.includes(p.id));
      pipesUpdated = true;
    }

    if (now - lastPipeTime.current >= difficultySettings.pipeInterval) {
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
      pipesRef.current.push(newPipe);
      pipesUpdated = true;
    }

    if (pipesUpdated) {
      onPipesUpdate([...pipesRef.current]);
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
      stopGameLoop();
      onGameOver(scoreRef.current);
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
    onGameOver,
    onCountdownUpdate,
    onPipesUpdate,
    pipeDomNodesRef,
  ]);

  const resumeGameLoop = useCallback(() => {
    if (gameLoopRef.current) return;

    lastFrameTime.current = performance.now();
    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameLoop]);

  const triggerCountdown = useCallback(
    (seconds) => {
      countdownEndTimeRef.current = performance.now() + seconds * 1000;
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
    pipesRef.current = [];
    onPipesUpdate([]);
    pipeDomNodesRef.current.clear();
    birdY.current = gameDimensions.height / 2;
    birdVelocity.current = 0;
    lastPipeTime.current = 0;
    scoreUpdatedForPipes.current.clear();
    scoreRef.current = 0;
  }, [stopGameLoop, gameDimensions, onPipesUpdate, pipeDomNodesRef]);

  useEffect(() => stopGameLoop, [stopGameLoop]);

  return {
    birdDomRef,
    startGame,
    stopGameLoop,
    resumeGameLoop,
    restartGame,
    jump,
    triggerCountdown,
  };
};
