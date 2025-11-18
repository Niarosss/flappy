"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { useGameStatus } from "@/context/GameStatusContext";

const COLORS = {
  light: {
    sky: "#70c5ce",
    grass: "#8bc34a",
    mountain: "#a6c761",
    trunk: "#8B4513",
    leaf: "#558B2F",
    bush: "#7CB342",
    sun: "#ffeb3b",
    moon: "#f1f1f1",
  },
  dark: {
    sky: "#0a0a2a",
    grass: "#2e4600",
    mountain: "#264653",
    trunk: "#4e342e",
    leaf: "#1b5e20",
    bush: "#33691e",
    sun: "#ffb300",
    moon: "#d0e0ff",
  },
};

const HORIZON_OFFSET = 80;

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.substring(0, 2), 16),
    g: parseInt(h.substring(2, 4), 16),
    b: parseInt(h.substring(4, 6), 16),
  };
}

function interpolateColor(a, b, t) {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  const r = Math.round(c1.r + (c2.r - c1.r) * t);
  const g = Math.round(c1.g + (c2.g - c1.g) * t);
  const b_ = Math.round(c1.b + (c2.b - c1.b) * t);
  return `rgb(${r},${g},${b_})`;
}

export default function Background() {
  const { isGameActive } = useGameStatus();
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);

  const theme = resolvedTheme || "light";
  const paused = isGameActive ? "" : "is-paused";

  // Встановлюємо розміри
  useEffect(() => {
    setMounted(true);
    const update = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const [currentPalette, setCurrentPalette] = useState(() => {
    return resolvedTheme === "dark" ? COLORS.dark : COLORS.light;
  });

  const prevTheme = useRef(resolvedTheme);

  useEffect(() => {
    if (!mounted) return;
    if (prevTheme.current === resolvedTheme) return;

    const from = prevTheme.current === "dark" ? COLORS.dark : COLORS.light;
    const to = resolvedTheme === "dark" ? COLORS.dark : COLORS.light;

    prevTheme.current = resolvedTheme;

    let start = null;
    const duration = 1500;

    function animate(time) {
      if (!start) start = time;
      const progress = Math.min((time - start) / duration, 1);
      const interp = {};
      Object.keys(to).forEach((key) => {
        interp[key] = interpolateColor(from[key], to[key], progress);
      });
      setCurrentPalette(interp);
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [resolvedTheme, mounted]);

  if (!mounted || dimensions.width === 0) {
    return (
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        style={{ backgroundColor: COLORS.light.sky }}
      />
    );
  }

  const { width, height } = dimensions;
  const HORIZON_Y = height - HORIZON_OFFSET;

  const sunY = theme === "light" ? 80 : height + 150;
  const moonY = theme === "dark" ? 120 : height + 150;

  const AnimationStyles = (
    <style>
      {`
        .is-paused { animation-play-state: paused !important; }

        @keyframes scroll-clouds { to { transform: translateX(-${width}px); } }
        .animate-clouds { animation: scroll-clouds 25s linear infinite; width: ${
          width * 3
        }px; }

        @keyframes scroll-trees { to { transform: translateX(-${width}px); } }
        .animate-trees { animation: scroll-trees 14s linear infinite; width: ${
          width * 3
        }px; }

        @keyframes scroll-ground { to { transform: translateX(-${width}px); } }
        .animate-ground { animation: scroll-ground 9s linear infinite; width: ${
          width * 3
        }px; }
      `}
    </style>
  );

  return (
    <div
      ref={containerRef}
      className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none overflow-hidden"
    >
      {AnimationStyles}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Небо */}
        <motion.rect
          width="100%"
          height="100%"
          fill={currentPalette.sky}
          transition={{ duration: 3 }}
        />

        {/* Сонце/Місяць */}
        <AnimatePresence mode="wait">
          <motion.circle
            key={theme === "light" ? "sun" : "moon"}
            cx={width - 100}
            cy={theme === "light" ? sunY : moonY}
            r={theme === "light" ? 50 : 35}
            fill={theme === "light" ? currentPalette.sun : currentPalette.moon}
            initial={{ cy: height + 150 }}
            animate={{ cy: theme === "light" ? sunY : moonY }}
            exit={{ cy: height + 150 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>

        {/* Гори */}
        <path
          d={`M0 ${HORIZON_Y - 30} L${width * 0.25} ${HORIZON_Y} L${
            width * 0.5
          } ${HORIZON_Y - 20} L${width * 0.75} ${HORIZON_Y} L${width} ${
            HORIZON_Y - 10
          } V${HORIZON_Y} H0 Z`}
          fill={currentPalette.mountain}
        />

        {/* Земля */}
        <rect
          y={HORIZON_Y}
          width="100%"
          height={height - HORIZON_Y}
          fill={currentPalette.grass}
        />

        {/* Патерни */}
        <defs>
          {/* Хмари */}
          <g id="clouds_pattern">
            <g transform="translate(50,50) scale(0.6)">
              <circle cx="0" cy="0" r="30" fill="white" />
              <circle cx="30" cy="10" r="40" fill="white" />
              <circle cx="60" cy="0" r="35" fill="white" />
            </g>
            <g transform="translate(350,100) scale(0.9)">
              <circle cx="0" cy="0" r="45" fill="white" />
              <circle cx="50" cy="10" r="55" fill="white" />
              <circle cx="100" cy="0" r="50" fill="white" />
            </g>
            <g transform="translate(700,30) scale(1.2)">
              <circle cx="0" cy="0" r="60" fill="white" />
              <circle cx="60" cy="10" r="70" fill="white" />
              <circle cx="120" cy="0" r="65" fill="white" />
            </g>
          </g>

          {/* Кущі */}
          <g id="ground_details_pattern">
            <path
              d={`M10 ${HORIZON_Y} Q30 ${HORIZON_Y - 15}, 50 ${HORIZON_Y} L50 ${
                HORIZON_Y - 5
              } Q40 ${HORIZON_Y - 25}, 20 ${HORIZON_Y - 5} Z`}
              fill={currentPalette.bush}
              stroke={currentPalette.trunk}
              strokeWidth="1"
            />
            <rect
              x="200"
              y={HORIZON_Y - 25}
              width="60"
              height="25"
              fill={currentPalette.bush}
              rx="10"
            />
            <circle cx="450" cy={HORIZON_Y - 3} r="8" fill="#555" />
            <path
              d={`M600 ${HORIZON_Y} Q620 ${
                HORIZON_Y - 20
              }, 640 ${HORIZON_Y} Q660 ${HORIZON_Y - 10}, 680 ${HORIZON_Y} Z`}
              fill={currentPalette.bush}
            />
          </g>

          {/* Дерева */}
          <g id="trees_pattern">
            <g transform={`translate(100, ${HORIZON_Y}) scale(1.5)`}>
              <rect
                x="-5"
                y="-60"
                width="10"
                height="60"
                fill={currentPalette.trunk}
              />
              <polygon
                points="-25,-30 25,-30 0,-70"
                fill={currentPalette.leaf}
              />
              <polygon
                points="-20,-50 20,-50 0,-85"
                fill={currentPalette.leaf}
              />
              <polygon
                points="-15,-70 15,-70 0,-100"
                fill={currentPalette.leaf}
              />
            </g>
            <g transform={`translate(350, ${HORIZON_Y}) scale(1.2)`}>
              <rect
                x="-7"
                y="-40"
                width="14"
                height="40"
                fill={currentPalette.trunk}
              />
              <circle cx="-15" cy="-45" r="25" fill={currentPalette.leaf} />
              <circle cx="15" cy="-50" r="30" fill={currentPalette.leaf} />
              <circle cx="0" cy="-60" r="28" fill={currentPalette.leaf} />
            </g>
            <g transform={`translate(600, ${HORIZON_Y}) scale(1)`}>
              <rect
                x="-4"
                y="-35"
                width="8"
                height="35"
                fill={currentPalette.trunk}
              />
              <polygon
                points="-18,-15 18,-15 0,-50"
                fill={currentPalette.leaf}
              />
              <polygon
                points="-12,-30 12,-30 0,-60"
                fill={currentPalette.leaf}
              />
            </g>
          </g>

          {/* Зірки */}
          {theme === "dark" && (
            <g id="stars_pattern">
              {[...Array(50)].map((_, i) => (
                <circle
                  key={i}
                  cx={Math.random() * width}
                  cy={Math.random() * HORIZON_Y}
                  r={Math.random() * 1.5 + 0.5}
                  fill="white"
                  opacity={0.7}
                />
              ))}
            </g>
          )}
        </defs>

        {/* Хмари */}
        <g className={`animate-clouds ${paused}`}>
          <use href="#clouds_pattern" x="0" />
          <use href="#clouds_pattern" x={width} />
          <use href="#clouds_pattern" x={width * 2} />
        </g>

        {/* Дерева */}
        <g className={`animate-trees ${paused}`}>
          <use href="#trees_pattern" x="0" />
          <use href="#trees_pattern" x={width} />
          <use href="#trees_pattern" x={width * 2} />
        </g>

        {/* Кущі */}
        <g className={`animate-ground ${paused}`}>
          <use href="#ground_details_pattern" x="0" />
          <use href="#ground_details_pattern" x={width} />
          <use href="#ground_details_pattern" x={width * 2} />
        </g>

        {/* Зірки */}
        {theme === "dark" && <use href="#stars_pattern" />}
      </svg>
    </div>
  );
}
