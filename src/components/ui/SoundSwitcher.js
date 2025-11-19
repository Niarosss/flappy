"use client";

import { useGame } from "@/context/GameContext";
import { useTranslations } from "next-intl";
import {
  SpeakerSimpleHighIcon,
  SpeakerSimpleSlashIcon,
} from "@phosphor-icons/react";

export default function SoundSwitcher() {
  const { soundsEnabled, toggleSound } = useGame();
  const t = useTranslations("SettingsPage");

  const soundOptions = [
    { code: true, name: t("soundOn") },
    { code: false, name: t("soundOff") },
  ];

  return (
    <div className="flex justify-center rounded-xl overflow-hidden select-none backdrop-blur-sm border border-white/20 dark:border-white/10 bg-slate-300/10 dark:bg-slate-600/10">
      <div className="w-32 flex items-center gap-2 px-3 py-2 font-semibold border-r border-white/20 bg-slate-100/20 dark:bg-slate-400/20">
        {soundsEnabled ? (
          <SpeakerSimpleHighIcon size={18} weight="duotone" />
        ) : (
          <SpeakerSimpleSlashIcon size={18} weight="duotone" />
        )}
        {t("sound")}
      </div>
      {soundOptions.map((option) => (
        <label
          key={String(option.code)}
          className={`flex justify-center radio p-2 flex-1 cursor-pointer transition-colors duration-200 ${
            option.code === soundsEnabled
              ? "bg-green-600/30 dark:bg-green-300/30 text-neutral-900 dark:text-neutral-100"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-slate-900/10 dark:hover:bg-slate-400/10"
          }`}
          onClick={() => toggleSound(option.code)}
        >
          <div className="title px-2">{option.name}</div>
        </label>
      ))}
    </div>
  );
}
