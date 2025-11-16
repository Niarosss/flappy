"use client";
import { useTranslations } from "next-intl";

import Modal from "@/components/ui/Modal";
import LangSwitcher from "@/components/ui/LangSwitcher";
import ThemeSwitcher from "@/components/ui/ThemeSwitcher";

export default function Settings() {
  const t = useTranslations("SettingsPage");

  return (
    <Modal className="max-w-md">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 my-10 text-center">
        {t("title")}
      </h2>

      <div className="mb-4">
        <LangSwitcher />
      </div>
      <div className="border-t border-white/20 my-6"></div>

      <div className="mt-4">
        <ThemeSwitcher />
      </div>
    </Modal>
  );
}
