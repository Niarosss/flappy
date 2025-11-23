import { useMemo } from "react";

export const useDifficultySettings = (difficulty, isMobile) => {
  const speedModifier = isMobile ? 0.8 : 1.0;

  const settings = useMemo(() => {
    const baseSettings = {
      easy: {
        gravity: 0.6,
        jump: -9,
        pipeSpeed: 8,
        pipeInterval: 1700,
        pipeGap: 140,
      },
      medium: {
        gravity: 0.7,
        jump: -10,
        pipeSpeed: 9,
        pipeInterval: 1500,
        pipeGap: 130,
      },
      hard: {
        gravity: 0.8,
        jump: -11,
        pipeSpeed: 10,
        pipeInterval: 1300,
        pipeGap: 120,
      },
    };

    const current = baseSettings[difficulty];

    return {
      gravity: current.gravity * speedModifier,
      jump: current.jump * speedModifier,
      pipeSpeed: current.pipeSpeed * speedModifier,
      pipeInterval: current.pipeInterval,
      pipeGap: current.pipeGap,
    };
  }, [difficulty, speedModifier]);

  return settings;
};
