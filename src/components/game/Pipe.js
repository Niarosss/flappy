"use client";

import React, { forwardRef } from "react";
import { useTheme } from "next-themes";

const THEMES = {
  light: {
    pipe: "#7CB342",
    border: "#388E3C",
    shadow: "#558B2F",
  },
  dark: {
    pipe: "#33691e",
    border: "#2e7d32",
    shadow: "#1b5e20",
  },
};

const Pipe = forwardRef(function Pipe(
  { pipeData, gameHeight, pipeWidth },
  ref
) {
  const FLANGE_WIDTH = pipeWidth + 13;
  const FLANGE_HEIGHT = 30;

  const { x, topHeight, gap } = pipeData;
  const topPipeRef = ref.top;
  const bottomPipeRef = ref.bottom;
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme || "light";
  const colors = THEMES[theme];

  const transformStyle = `translateX(${x}px)`;
  const flangeLeftOffset = (pipeWidth - FLANGE_WIDTH) / 1.6;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        height: gameHeight,
        width: pipeWidth,
      }}
    >
      {/* Верхня труба */}
      <div
        ref={topPipeRef}
        style={{
          position: "absolute",
          top: 0,
          width: pipeWidth,
          height: topHeight,
          backgroundColor: colors.pipe,
          borderLeft: `2px solid ${colors.border}`,
          borderRight: `2px solid ${colors.border}`,
          borderBottom: "none",
          zIndex: 10,
          transform: transformStyle,
          backgroundImage: `linear-gradient(to right, ${colors.pipe} 85%, ${colors.shadow} 100%)`,
        }}
      >
        {/* Голова верхньої труби */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: flangeLeftOffset,
            width: FLANGE_WIDTH,
            height: FLANGE_HEIGHT,
            backgroundColor: colors.pipe,
            borderLeft: `4px solid ${colors.border}`,
            borderRight: `4px solid ${colors.border}`,
            borderBottom: "none",
            borderRadius: "0 0 8px 8px",
            boxShadow: `inset 0 -5px 5px ${colors.shadow}`,
          }}
        />
      </div>

      {/* Нижня труба */}
      <div
        ref={bottomPipeRef}
        style={{
          position: "absolute",
          top: topHeight + gap,
          width: pipeWidth,
          height: gameHeight - (topHeight + gap),
          backgroundColor: colors.pipe,
          borderLeft: `2px solid ${colors.border}`,
          borderRight: `2px solid ${colors.border}`,
          borderTop: "none",
          zIndex: 10,
          transform: transformStyle,
          backgroundImage: `linear-gradient(to right, ${colors.pipe} 85%, ${colors.shadow} 100%)`,
        }}
      >
        {/* Голова нижньої труби */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: flangeLeftOffset,
            width: FLANGE_WIDTH,
            height: FLANGE_HEIGHT,
            backgroundColor: colors.pipe,
            borderLeft: `4px solid ${colors.border}`,
            borderRight: `4px solid ${colors.border}`,
            borderTop: "none",
            borderRadius: "8px 8px 0 0",
            boxShadow: `inset 0 5px 5px ${colors.shadow}`,
          }}
        />
      </div>
    </div>
  );
});

Pipe.displayName = "Pipe";
export default Pipe;
