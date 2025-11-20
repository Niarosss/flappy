"use client";

import React from "react";

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

const Pipe = ({ pipeData, gameHeight, pipeWidth, theme }) => {
  const FLANGE_WIDTH = pipeWidth + 13;
  const FLANGE_HEIGHT = 30;

  const { x, topHeight, gap } = pipeData;

  const currentTheme = theme === "dark" ? "dark" : "light";
  const colors = THEMES[currentTheme];

  const transformStyle = `translateX(${x}px)`;
  const flangeLeftOffset = (pipeWidth - FLANGE_WIDTH) / 1.6;

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width: pipeWidth,
        height: gameHeight,
        transform: transformStyle,
        zIndex: 10,
      }}
    >
      {/* Верхня труба */}
      <div
        style={{
          position: "absolute",
          top: 0,
          width: pipeWidth,
          height: topHeight,
          backgroundColor: colors.pipe,
          borderLeft: `2px solid ${colors.border}`,
          borderRight: `2px solid ${colors.border}`,
          borderBottom: "none",
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
        style={{
          position: "absolute",
          top: topHeight + gap,
          width: pipeWidth,
          height: gameHeight - (topHeight + gap),
          backgroundColor: colors.pipe,
          borderLeft: `2px solid ${colors.border}`,
          borderRight: `2px solid ${colors.border}`,
          borderTop: "none",
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
};

Pipe.displayName = "Pipe";
export default Pipe;
