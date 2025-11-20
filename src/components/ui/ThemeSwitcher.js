"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import { PaintRollerIcon } from "@phosphor-icons/react";

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const t = useTranslations("SettingsPage");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSelectTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const themeOptions = [
    { code: "light", name: t("themeLight") },
    { code: "dark", name: t("themeDark") },
    { code: "system", name: t("themeSystem") },
  ];

  if (!mounted) {
    return (
      <div className="flex justify-center rounded-xl overflow-hidden select-none backdrop-blur-sm border border-white/20 dark:border-white/10 bg-slate-300/10 dark:bg-slate-600/10">
        <div className="w-28 px-4 py-2 font-semibold border-r border-white/20 bg-slate-100/20 dark:bg-slate-400/20">
          {t("themeTitle")}
        </div>

        {themeOptions.map((option) => (
          <label
            key={option.code}
            className="flex justify-center radio p-2 flex-1 cursor-pointer transition-colors duration-200 text-neutral-800"
          >
            <div className="title px-2">{option.name}</div>
          </label>
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center rounded-xl overflow-hidden select-none backdrop-blur-sm border border-white/20 dark:border-white/10 bg-slate-300/10 dark:bg-slate-600/10">
      <div className="w-32 flex items-center gap-2 px-3 py-2 font-semibold border-r border-white/20 bg-slate-100/20 dark:bg-slate-400/20">
        <PaintRollerIcon size={18} weight="duotone" />
        {t("themeTitle")}
      </div>
      {themeOptions.map((option) => (
        <label
          key={option.code}
          className={`flex justify-center radio p-2 flex-1 cursor-pointer transition-colors duration-200 ${
            option.code === theme
              ? "bg-green-600/30 dark:bg-green-300/30 text-neutral-900 dark:text-neutral-100"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-slate-900/10 dark:hover:bg-slate-400/10"
          }`}
        >
          <input
            className="my-auto transform scale-125 appearance-none hidden"
            type="radio"
            name="theme"
            value={option.code}
            checked={option.code === theme}
            onChange={() => handleSelectTheme(option.code)}
          />
          <div className="title px-2">{option.name}</div>
        </label>
      ))}
    </div>
  );
}
