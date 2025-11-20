"use client";

import { useTranslations } from "next-intl";
import Modal from "@/components/ui/Modal";
import {
  GameControllerIcon,
  JoystickIcon,
  KeyboardIcon,
  MouseIcon,
  HandTapIcon,
} from "@phosphor-icons/react";

export default function HelpPageClient() {
  const t = useTranslations("HelpPage");
  return (
    <Modal className="max-w-lg">
      <h2 className="text-4xl font-bold text-slate-900 dark:text-slate-100 my-10 text-center">
        {t("title")}
      </h2>

      <div className="space-y-6 text-left ">
        <div>
          <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <GameControllerIcon size={28} weight="duotone" />
            {t("objectiveTitle")}
          </h3>
          <p className="text-base">{t("objectiveText")}</p>
        </div>

        <div className="border-t border-white/20"></div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 flex items-center gap-2 text-neutral-800 dark:text-neutral-200">
            <JoystickIcon size={28} weight="duotone" />
            {t("controlsTitle")}
          </h3>
          <div className="space-y-3">
            <div>
              <h4 className="font-bold text-lg flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                <MouseIcon size={24} weight="duotone" />
                {t("mouseControlsTitle")}
              </h4>
              <p className="ml-7 text-neutral-700 dark:text-neutral-300">
                {t("clickText")}
              </p>
            </div>
            <div>
              <h4 className="font-bold text-lg flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                <KeyboardIcon size={24} weight="duotone" />
                {t("keyboardControlsTitle")}
              </h4>
              <ul className="list-disc list-inside ml-2 text-neutral-700 dark:text-neutral-300">
                <li>{t("jumpKey")}</li>
                <li>{t("pauseKey")}</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-lg flex items-center gap-1 text-neutral-800 dark:text-neutral-200">
                <HandTapIcon size={24} weight="duotone" />
                {t("touchControlsTitle")}
              </h4>
              <p className="ml-7 text-neutral-700 dark:text-neutral-300">
                {t("touchText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
