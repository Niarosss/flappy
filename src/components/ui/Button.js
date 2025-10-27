// components/UI/Button.jsx
import React from "react";

// Оновлено базові стилі: змінено колір рамки для світлої/темної теми
const base =
  "flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold active:scale-95 transition-all duration-200 shadow-lg border border-black/10 dark:border-white/10 backdrop-blur-sm hover:shadow-[0_0_8px_var(--glow)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

// Оновлено варіанти: додано прозорість та стилі для темної теми (dark:)
const variants = {
  green:
    "bg-green-500/80 hover:bg-green-500 text-white dark:bg-green-600/50 dark:hover:bg-green-500/60 dark:text-green-100 [--glow:rgba(34,197,94,0.5)] dark:[--glow:rgba(34,197,94,0.7)]",
  blue: "bg-blue-600/80 hover:bg-blue-600 text-white dark:bg-blue-600/50 dark:hover:bg-blue-500/60 dark:text-blue-100 [--glow:rgba(59,130,246,0.5)] dark:[--glow:rgba(59,130,246,0.7)]",
  gray: "bg-neutral-800/80 hover:bg-neutral-700 text-neutral-200 dark:bg-neutral-700/50 dark:hover:bg-neutral-400/30 dark:text-neutral-200 [--glow:rgba(255,255,255,0.15)] dark:[--glow:rgba(255,255,255,0.25)]",
  red: "bg-red-600/80 hover:bg-red-600 text-white dark:bg-red-600/50 dark:hover:bg-red-500/60 dark:text-red-100 [--glow:rgba(239,68,68,0.5)] dark:[--glow:rgba(239,68,68,0.7)]",
  purple:
    "bg-purple-600/80 hover:bg-purple-600 text-white dark:bg-purple-600/50 dark:hover:bg-purple-500/60 dark:text-purple-100 [--glow:rgba(168,85,247,0.5)] dark:[--glow:rgba(168,85,247,0.7)]",
};

export default function Button({
  variant = "gray",
  className = "",
  children,
  ...props
}) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
