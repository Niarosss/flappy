"use client";

import React, { forwardRef, useMemo } from "react";

const THEMES = {
  light: {
    pipeBody: "#7CB342",
    pipeHighlight: "#a5d6a7",
    pipeBorder: "#689F38",
    pipeShadow: "rgba(0, 0, 0, 0.15)",
  },
  dark: {
    pipeBody: "#2E4B26",
    pipeHighlight: "#456D3A",
    pipeBorder: "#1B3D18",
    pipeShadow: "rgba(0, 0, 0, 0.3)",
  },
};

const Pipe = forwardRef(({ pipeData, gameHeight, pipeWidth, theme }, ref) => {
  const { x, topHeight, gap } = pipeData;
  const bottomHeight = gameHeight - topHeight - gap;

  const currentTheme = theme === "dark" ? "dark" : "light";
  const colors = THEMES[currentTheme];

  const FLANGE_WIDTH = pipeWidth + 8;
  const FLANGE_HEIGHT = 30;
  const flangeLeftOffset = (pipeWidth - FLANGE_WIDTH) / 1.7;

  const styles = useMemo(
    () => ({
      container: {
        position: "absolute",
        left: 0,
        top: 0,
        width: pipeWidth,
        height: gameHeight,
        transform: `translateX(${x}px)`,
        zIndex: 10,
      },
      upperPipe: {
        position: "absolute",
        top: 0,
        width: "100%",
        height: topHeight,
        backgroundColor: colors.pipeBody,
        borderLeft: `1px solid ${colors.pipeBorder}`,
        borderRight: `1px solid ${colors.pipeBorder}`,
        backgroundImage: `linear-gradient(90deg, ${colors.pipeBody} 0%, ${colors.pipeHighlight} 50%, ${colors.pipeBody} 100%)`,
      },
      upperFlange: {
        position: "absolute",
        left: flangeLeftOffset,
        bottom: -2,
        width: FLANGE_WIDTH,
        height: FLANGE_HEIGHT,
        backgroundColor: colors.pipeBody,
        border: `1px solid ${colors.pipeBorder}`,
        borderRadius: "0 0 6px 6px",
        boxShadow: `inset 0 3px 3px ${colors.pipeHighlight}, inset 0 -3px 3px ${colors.pipeShadow}`,
      },
      lowerPipe: {
        position: "absolute",
        top: topHeight + gap,
        width: "100%",
        height: bottomHeight,
        backgroundColor: colors.pipeBody,
        borderLeft: `1px solid ${colors.pipeBorder}`,
        borderRight: `1px solid ${colors.pipeBorder}`,
        backgroundImage: `linear-gradient(90deg, ${colors.pipeBody} 0%, ${colors.pipeHighlight} 50%, ${colors.pipeBody} 100%)`,
      },
      lowerFlange: {
        position: "absolute",
        left: flangeLeftOffset,
        top: -2,
        width: FLANGE_WIDTH,
        height: FLANGE_HEIGHT,
        backgroundColor: colors.pipeBody,
        border: `1px solid ${colors.pipeBorder}`,
        borderRadius: "6px 6px 0 0",
        boxShadow: `inset 0 3px 3px ${colors.pipeHighlight}, inset 0 -3px 3px ${colors.pipeShadow}`,
      },
    }),
    [
      pipeData,
      gameHeight,
      pipeWidth,
      colors,
      gap,
      flangeLeftOffset,
      FLANGE_WIDTH,
      FLANGE_HEIGHT,
    ]
  );

  return (
    <div ref={ref} style={styles.container}>
      <div style={styles.upperPipe}>
        <div style={styles.upperFlange} />
      </div>
      <div style={styles.lowerPipe}>
        <div style={styles.lowerFlange} />
      </div>
    </div>
  );
});

Pipe.displayName = "Pipe";
export default Pipe;
