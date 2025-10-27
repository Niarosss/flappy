"use client";

import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { GlobeIcon } from "@phosphor-icons/react";

export default function LangSwitcher() {
  const router = useRouter();
  const currentLocale = useLocale();
  const [selectedLocale, setSelectedLocale] = useState(currentLocale);
  const t = useTranslations("SettingsPage");

  const handleSelectLocale = (newLocale) => {
    setSelectedLocale(newLocale);

    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${
      60 * 60 * 24 * 365
    }`;

    router.refresh();
  };

  const localeOptions = routing.locales.map((localeCode) => ({
    code: localeCode,
    name:
      localeCode === "en"
        ? "English"
        : localeCode === "uk"
        ? "Українська"
        : localeCode,
  }));

  return (
    <div className="flex justify-center rounded-xl overflow-hidden select-none backdrop-blur-sm border border-white/20 dark:border-white/10 bg-slate-300/10 dark:bg-slate-600/10">
      <div className="w-32 flex items-center gap-2 px-3 py-2 font-semibold border-r border-white/20 bg-slate-100/20 dark:bg-slate-400/20">
        <GlobeIcon size={18} weight="duotone" />
        {t("lang")}
      </div>
      {localeOptions.map((lang) => (
        <label
          key={lang.code}
          className={`flex radio p-2 cursor-pointer flex-1 transition-colors justify-center duration-200 ${
            lang.code === selectedLocale
              ? "bg-green-600/30 dark:bg-green-300/30 text-neutral-900 dark:text-neutral-100"
              : "text-neutral-600 dark:text-neutral-400 hover:bg-slate-900/10 dark:hover:bg-slate-400/10"
          }`}
        >
          <input
            className="my-auto transform scale-125 appearance-none hidden"
            type="radio"
            name="language"
            value={lang.code}
            checked={lang.code === selectedLocale}
            onChange={() => handleSelectLocale(lang.code)}
          />
          <div className="title px-2">{lang.name}</div>
        </label>
      ))}
    </div>
  );
}
