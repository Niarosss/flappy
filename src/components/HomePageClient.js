"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  GameControllerIcon,
  TrophyIcon,
  GearSixIcon,
  BirdIcon,
  GoogleLogoIcon,
  InfoIcon,
} from "@phosphor-icons/react";
import { useSession, signIn } from "next-auth/react";
import UserBlock from "@/components/ui/UserBlock";

export default function HomePageClient({ session: initialSession }) {
  const { status } = useSession();
  const t = useTranslations("HomePage");
  const router = useRouter();

  const isAuthed = !!initialSession;
  const user = initialSession?.user;

  const isLoading = status === "loading";

  const handleStart = () => {
    if (isAuthed) router.push("/game");
    else signIn("google");
  };

  return (
    <Modal className="max-w-md text-center p-6">
      <div className="mb-4 flex justify-center items-center gap-3">
        <BirdIcon
          size={56}
          weight="duotone"
          className="text-yellow-700/50 dark:text-yellow-500/50"
        />
        <h1 className="text-5xl font-extrabold text-cyan-950/60 dark:text-cyan-400/60 drop-shadow-sm">
          Flappy Bird
        </h1>
      </div>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8">
        {t("title")}
      </p>

      <div className="mb-8 overflow-hidden transition-[height] duration-300 ease-out">
        <UserBlock user={user} />
      </div>
      <div className="space-y-4">
        <Button
          variant="green"
          onClick={handleStart}
          disabled={isLoading}
          className="text-lg font-bold w-full"
        >
          {isAuthed ? (
            <>
              <GameControllerIcon size={24} weight="duotone" />
              {t("start")}
            </>
          ) : (
            <>
              <GoogleLogoIcon size={24} weight="duotone" />
              {t("signInGoogle")}
            </>
          )}
        </Button>

        <Button
          variant="blue"
          className="text-lg font-bold w-full"
          onClick={() => router.push("/leaders")}
        >
          <TrophyIcon size={24} weight="duotone" />
          {t("leader")}
        </Button>
        <div className="flex gap-4">
          <Button
            variant="gray"
            className="w-full"
            onClick={() => router.push("/settings")}
          >
            <GearSixIcon size={24} weight="duotone" />
            {t("settings")}
          </Button>
          <Button
            variant="gray"
            className="w-full"
            onClick={() => router.push("/help")}
          >
            <InfoIcon size={24} weight="duotone" />
            {t("help")}
          </Button>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-300/30 dark:border-neutral-600/30 text-center text-sm text-neutral-600 dark:text-neutral-400">
        <p>{t("words")}</p>
      </div>
    </Modal>
  );
}
