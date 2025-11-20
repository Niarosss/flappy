"use client";
import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import LangSwitcher from "@/components/ui/LangSwitcher";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";
import SoundSwitcher from "@/components/ui/SoundSwitcher";

export default function Settings() {
  const t = useTranslations("SettingsPage");

  return (
    <Modal className="max-w-md">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 my-10 text-center">
        {t("title")}
      </h2>

      <div className="space-y-4">
        <div>
          <LangSwitcher />
          <p className="text-sm text-slate-600 dark:text-slate-400 px-2 mt-4">
            {t("languageDescription")}
          </p>
        </div>

        <div className="border-t border-white/20"></div>

        <div>
          <ThemeSwitcher />
          <p className="text-sm text-slate-600 dark:text-slate-400 px-2 mt-4">
            {t("themeDescription")}
          </p>
        </div>

        <div className="border-t border-white/20"></div>

        <div>
          <SoundSwitcher />
          <p className="text-sm text-slate-600 dark:text-slate-400 px-2 mt-4">
            {t("soundDescription")}
          </p>
        </div>
      </div>
    </Modal>
  );
}
