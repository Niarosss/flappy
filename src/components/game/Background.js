"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "@/context/GameContext";

// ЗМІНЕНО: Додано тінь для каміння
const COLORS = {
  light: {
    skyTop: "#47a7d8",
    skyBottom: "#70c5ce",
    grass: "#8bc34a",
    mountain: "#a6c761",
    mountainFar: "#bdd986",
    trunk: "#8B4513",
    leaf: "#558B2F",
    leafShadow: "#426d24",
    bush: "#7CB342",
    sun: "#ffeb3b",
    moon: "#f1f1f1",
    rock: "#a1a1a1",
    rockShadow: "#8a8a8a",
  },
  dark: {
    skyTop: "#0a0a2a",
    skyBottom: "#1c2a5e",
    grass: "#2e4600",
    mountain: "#264653",
    mountainFar: "#3a687a",
    trunk: "#4e342e",
    leaf: "#1b5e20",
    leafShadow: "#144518",
    bush: "#33691e",
    sun: "#ffb300",
    moon: "#d0e0ff",
    rock: "#555555",
    rockShadow: "#444444",
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
  const { isGameActive } = useGame();
  const { resolvedTheme } = useTheme();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const { width, height } = dimensions;
  const HORIZON_Y = height - HORIZON_OFFSET;
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef(null);
  const hasThemeChangedRef = useRef(false);
  const [isThemeAnimating, setIsThemeAnimating] = useState(false);
  const cloudsRef = useRef(null);

  const theme = resolvedTheme || "light";
  const paused = isGameActive ? "" : "is-paused";

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

    hasThemeChangedRef.current = true;
    setIsThemeAnimating(true);

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

      if (cloudsRef.current) {
        const fastScrollX = -progress * width;
        cloudsRef.current.style.transform = `translateX(${fastScrollX}px)`;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsThemeAnimating(false);
        if (cloudsRef.current) {
          cloudsRef.current.style.transform = "";
        }
      }
    }

    requestAnimationFrame(animate);
  }, [resolvedTheme, mounted, width]);

  const stars = useMemo(() => {
    if (theme !== "dark" || width === 0) return [];
    return [...Array(50)].map((_, i) => ({
      key: i,
      cx: Math.random() * width,
      cy: Math.random() * HORIZON_Y,
      r: Math.random() * 1.5 + 0.5,
    }));
  }, [theme, width, height]);

  if (!mounted || dimensions.width === 0) {
    return (
      <div
        ref={containerRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
        style={{ backgroundColor: COLORS.light.sky }}
      />
    );
  }

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
        <defs>
          <linearGradient id="sky-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={currentPalette.skyTop} />
            <stop offset="100%" stopColor={currentPalette.skyBottom} />
          </linearGradient>
        </defs>

        {/* Небо */}
        <rect width="100%" height="100%" fill="url(#sky-gradient)" />

        {/* Сонце/Місяць */}
        <AnimatePresence mode="wait">
          <motion.circle
            key={theme === "light" ? "sun" : "moon"}
            cx={width - 100}
            cy={theme === "light" ? sunY : moonY}
            r={theme === "light" ? 50 : 35}
            fill={theme === "light" ? currentPalette.sun : currentPalette.moon}
            initial={hasThemeChangedRef.current ? { cy: height + 150 } : false}
            animate={{ cy: theme === "light" ? sunY : moonY }}
            exit={{ cy: height + 150 }}
            transition={{ duration: 1 }}
          />
        </AnimatePresence>

        <AnimatePresence>
          {/* Зірки */}
          {theme === "dark" &&
            stars.map((star) => (
              <motion.circle
                key={star.key}
                cx={star.cx}
                cy={star.cy}
                r={star.r}
                fill="white"
                initial={
                  hasThemeChangedRef.current
                    ? { opacity: 0, cx: star.cx + 100, cy: star.cy + 50 }
                    : false
                }
                animate={{ opacity: 0.7, cx: star.cx, cy: star.cy }}
                exit={{ opacity: 0, cx: star.cx - 100, cy: star.cy - 50 }}
                transition={{ duration: 1 }}
              />
            ))}
        </AnimatePresence>

        {/* Гори */}

        <path
          d={`M0 ${HORIZON_Y - 15} L${width * 0.3} ${HORIZON_Y - 40} L${
            width * 0.6
          } ${HORIZON_Y - 20} L${width} ${HORIZON_Y - 35} V${HORIZON_Y} H0 Z`}
          fill={currentPalette.mountainFar}
        />

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

        <defs>
          {/* Хмари */}
          <g id="clouds_pattern">
            <g transform="translate(150,50) scale(0.6)">
              <circle cx="0" cy="0" r="30" fill="white" />
              <circle cx="30" cy="10" r="40" fill="white" />
              <circle cx="60" cy="0" r="35" fill="white" />
            </g>
            <g transform="translate(550,100) scale(0.9)">
              <circle cx="0" cy="0" r="45" fill="white" />
              <circle cx="50" cy="10" r="55" fill="white" />
              <circle cx="100" cy="0" r="50" fill="white" />
            </g>
            <g transform="translate(1100,30) scale(1.2)">
              <circle cx="0" cy="0" r="60" fill="white" />
              <circle cx="60" cy="10" r="70" fill="white" />
              <circle cx="120" cy="0" r="65" fill="white" />
            </g>
          </g>

          {/* КУЩІ */}
          <g id="ground_details_pattern">
            {/* Кущ 1 */}
            <g transform={`translate(150, ${HORIZON_Y})`}>
              <path
                d="M -20 0 C -30 -25, 0 -30, 20 0 Z"
                fill={currentPalette.bush}
              />
              <path
                d="M 20 0 C 0 -30, 10 -20, 15 -5 Z"
                fill={currentPalette.leafShadow}
                opacity="0.5"
              />
            </g>

            {/* Кущ 2 */}
            <g transform={`translate(900, ${HORIZON_Y}) scale(0.9)`}>
              <path
                d="M -25 0 L -15 -20 L 0 -15 L 15 -25 L 25 0 Z"
                fill={currentPalette.bush}
              />
              <path
                d="M 25 0 L 15 -25 L 5 -20 L 0 -15 L -5 -15 Z"
                fill={currentPalette.leafShadow}
                opacity="0.5"
              />
            </g>

            {/* Камені 1 */}
            <g transform={`translate(650, ${HORIZON_Y})`}>
              <circle cx="-5" cy="-4" r="10" fill={currentPalette.rock} />
              <circle cx="8" cy="-2" r="6" fill={currentPalette.rock} />
              <path
                d="M -5 -4 A 10 10 0 0 1 3 -11 A 10 10 0 0 0 -5 -4 Z"
                fill={currentPalette.rockShadow}
                opacity="0.7"
              />
              <path
                d="M 8 -2 A 6 6 0 0 1 12 -6 A 6 6 0 0 0 8 -2 Z"
                fill={currentPalette.rockShadow}
                opacity="0.7"
              />
            </g>

            {/* ДОДАНО: Кущ 3 (повтор) */}
            <g transform={`translate(1600, ${HORIZON_Y}) scale(1.1)`}>
              <path
                d="M -20 0 C -30 -25, 0 -30, 20 0 Z"
                fill={currentPalette.bush}
              />
              <path
                d="M 20 0 C 0 -30, 10 -20, 15 -5 Z"
                fill={currentPalette.leafShadow}
                opacity="0.5"
              />
            </g>

            {/* ДОДАНО: Камені 2 (варіація) */}
            <g transform={`translate(1450, ${HORIZON_Y}) scale(0.8)`}>
              <circle cx="-10" cy="-2" r="8" fill={currentPalette.rock} />
              <circle cx="5" cy="-5" r="12" fill={currentPalette.rock} />
              <path
                d="M 5 -5 A 12 12 0 0 1 14 -14 A 12 12 0 0 0 5 -5 Z"
                fill={currentPalette.rockShadow}
                opacity="0.7"
              />
            </g>
          </g>

          {/* Дерева (без змін) */}
          <g id="trees_pattern">
            {/* Дерево 1: Гостроверхе */}
            <g transform={`translate(100, ${HORIZON_Y}) scale(0.6)`}>
              <g transform="translate(-208, -541)">
                <path
                  fill={currentPalette.trunk}
                  d="M203.687 450.581h9.982v89.838h-9.982z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M242.184 475.076c0-18.505-33.506-79.806-33.506-79.806s-33.507 61.301-33.507 79.806 15.001 33.506 33.507 33.506 33.506-15.001 33.506-33.506z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M242.184 475.076c0-18.505-33.507-79.806-33.507-79.806v113.313c18.506 0 33.507-15.002 33.507-33.507z"
                />
              </g>
            </g>

            {/* Дерево 2: Розлоге */}
            <g transform={`translate(350, ${HORIZON_Y}) scale(0.8)`}>
              <g transform="translate(-590, -541)">
                <path
                  fill={currentPalette.trunk}
                  d="M620.991 486.211a6.802 6.802 0 0 1-6.793 6.794h-17.885V431.31h-9.982v48.663h-14.279a6.801 6.801 0 0 1-6.794-6.794v-27.866h-4.991v27.866c0 6.499 5.287 11.785 11.785 11.785h14.279v55.455h9.982v-42.424h17.885c6.497 0 11.784-5.287 11.784-11.785v-23.29h-4.991v23.291z"
                />
                <circle
                  cx="591.322"
                  cy="424.936"
                  r="29.666"
                  fill={currentPalette.leaf}
                  transform="rotate(-45.001 591.32 424.945)"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M591.322 395.27v59.332c16.384 0 29.666-13.282 29.666-29.666s-13.282-29.666-29.666-29.666z"
                />
                <circle
                  cx="562.763"
                  cy="437.826"
                  r="16.775"
                  fill={currentPalette.leaf}
                  transform="rotate(-48.685 562.805 437.83)"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M562.763 421.051v33.551c9.265 0 16.775-7.51 16.775-16.775 0-9.265-7.511-16.776-16.775-16.776z"
                />
                <circle
                  cx="623.487"
                  cy="454.602"
                  r="16.775"
                  fill={currentPalette.leaf}
                  transform="rotate(-49.12 623.464 454.588)"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M623.487 437.827v33.551c9.265 0 16.775-7.511 16.775-16.775 0-9.266-7.511-16.776-16.775-16.776z"
                />
              </g>
            </g>

            {/* ДЕРЕВО 3: Хвойне */}
            <g transform={`translate(600, ${HORIZON_Y}) scale(0.6)`}>
              <g transform="translate(-400, -541)">
                <path
                  fill={currentPalette.leaf}
                  d="m400 395.27-35.353 113.313h70.706z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M435.353 508.583 400 395.27v113.313z"
                />
                <path
                  fill={currentPalette.trunk}
                  d="m416.357 462.085-2.768-4.153-8.598 5.732v-13.083h-9.982v13.083l-8.598-5.732-2.768 4.153 11.366 7.578v5.994l-8.598-5.732-2.768 4.152 11.366 7.578v5.993l-8.598-5.731-2.768 4.152 11.366 7.578v46.773h9.982v-46.773l11.366-7.578-2.768-4.152-8.598 5.731v-5.993l11.366-7.578-2.768-4.152-8.598 5.732v-5.994z"
                />
              </g>
            </g>

            {/* ДЕРЕВО 4: Кущисте  */}
            <g transform={`translate(850, ${HORIZON_Y}) scale(0.65)`}>
              <g transform="translate(-113, -671)">
                <path
                  fill={currentPalette.trunk}
                  d="M145.498 617.116a6.801 6.801 0 0 1-6.794 6.794h-20.697v-24.123h2.599c3.474 0 6.3-2.825 6.3-6.299v-15.191h-4.991v15.191a1.31 1.31 0 0 1-1.309 1.308h-2.599v-33.827h-9.982v48.662H87.629a6.802 6.802 0 0 1-6.794-6.794V574.97h-4.991v27.867c0 6.499 5.287 11.785 11.785 11.785h20.397v55.455h9.982v-41.176h20.697c6.498 0 11.785-5.287 11.785-11.785v-13.032h-4.991v13.032z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M142.181 564.954c-3.228-16.615-15.058-28.941-29.165-28.941s-25.937 12.326-29.165 28.941h58.33z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M142.181 564.954c-3.228-16.615-15.058-28.941-29.165-28.941v28.941h29.165z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M101.251 592.993c-2.536-13.053-11.83-22.737-22.913-22.737s-20.377 9.683-22.913 22.737h45.826z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M101.251 592.993c-2.536-13.053-11.83-22.737-22.913-22.737v22.737h22.913z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M137.795 584.939c-1.481-7.625-6.911-13.282-13.385-13.282s-11.903 5.657-13.385 13.282h26.77z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M137.795 584.939c-1.482-7.625-6.911-13.282-13.385-13.282v13.282h13.385z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M171.577 609.104c-2.61-13.436-12.176-23.402-23.584-23.402-11.407 0-20.973 9.967-23.584 23.402h47.168z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M171.577 609.104c-2.61-13.436-12.176-23.402-23.584-23.402v23.402h23.584z"
                />
              </g>
            </g>

            {/* ДЕРЕВО 5: Хмара */}
            <g transform={`translate(1300, ${HORIZON_Y}) scale(0.8)`}>
              <g transform="translate(-686, -671)">
                <path
                  fill={currentPalette.trunk}
                  d="M681.992 580.239h9.982v89.838h-9.982z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M737.194 592.146a22.4 22.4 0 0 0 .088-1.747c0-9.104-5.522-16.916-13.397-20.277.019-.372.056-.739.056-1.116 0-9.699-6.274-17.917-14.978-20.863.021-.392.056-.779.056-1.177 0-12.172-9.867-22.039-22.039-22.039s-22.039 9.867-22.039 22.039c0 .397.039.785.056 1.177-8.704 2.946-14.978 11.164-14.978 20.863 0 .377.038.744.056 1.116-7.876 3.361-13.397 11.173-13.397 20.277 0 .59.043 1.169.088 1.747-7.893 3.354-13.429 11.176-13.429 20.292 0 12.172 9.868 22.039 22.039 22.039h83.201c12.172 0 22.039-9.867 22.039-22.039.001-9.116-5.535-16.938-13.428-20.292z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M728.584 634.478c12.172 0 22.039-9.867 22.039-22.039 0-9.117-5.536-16.939-13.429-20.292a22.4 22.4 0 0 0 .088-1.747c0-9.104-5.521-16.916-13.397-20.277.019-.372.056-.739.056-1.116 0-9.699-6.274-17.917-14.978-20.863.021-.392.06-.779.06-1.177 0-12.172-9.867-22.039-22.04-22.039v109.551h41.601z"
                />
              </g>
            </g>

            {/* Дерево 6: Овальне ("Льодяник") */}
            <g transform={`translate(1700, ${HORIZON_Y}) scale(0.55)`}>
              <g transform="translate(-304, -671)">
                <path
                  fill={currentPalette.trunk}
                  d="M299.348 567.415h9.982v102.662h-9.982z"
                />
                <path
                  fill={currentPalette.leaf}
                  d="M304.339 524.927c-18.505 0-33.506 15.001-33.506 33.506v46.3c0 18.505 15.001 33.506 33.506 33.506 18.505 0 33.507-15.001 33.507-33.506v-46.3c-.001-18.504-15.002-33.506-33.507-33.506z"
                />
                <path
                  fill={currentPalette.leafShadow}
                  d="M337.845 604.734v-46.3c0-18.505-15.001-33.506-33.507-33.506V638.24c18.506 0 33.507-15.001 33.507-33.506z"
                />
              </g>
            </g>
          </g>
        </defs>

        {/* Хмари */}
        <g
          ref={cloudsRef}
          // ЗМІНЕНО: Клас анімації тепер умовний
          className={`${!isThemeAnimating ? "animate-clouds" : ""} ${paused}`}
        >
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
      </svg>
    </div>
  );
}
