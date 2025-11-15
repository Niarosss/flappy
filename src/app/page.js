"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  GameControllerIcon,
  TrophyIcon,
  GearSixIcon,
  SignOutIcon,
  BirdIcon,
  GoogleLogoIcon,
} from "@phosphor-icons/react";
import { useSession, signIn, signOut } from "next-auth/react";
// ----------------------

export default function HomePage() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  const user = session?.user;

  const router = useRouter();
  const t = useTranslations("HomePage");

  const handlePrimaryAction = () => {
    if (isAuthenticated) {
      router.push("/game");
    } else {
      signIn("google");
    }
  };

  return (
    <Modal className="max-w-md text-center">
      <div className="mb-2 flex items-center justify-center gap-2 ">
        <BirdIcon size={48} weight="duotone" className="text-yellow-700/50" />
        <h1 className="text-5xl text-cyan-950/50 dark:text-cyan-300/50 font-extrabold drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          Flappy Bird
        </h1>
      </div>
      <p className="text-neutral-500 dark:text-neutral-300 mb-8">
        {t("title")}
      </p>

      {/* 1. ВІТАННЯ */}
      <div className="mb-8">
        {isAuthenticated ? (
          <div>
            <p className="text-lg text-neutral-700 dark:text-neutral-200 font-bold mb-2">
              {t("welcomeBack")}
            </p>
            <p className="text-xl font-semibold text-green-800 dark:text-green-600">
              {user.name || user.email}
            </p>
            {user.email && (
              <p className="text-xs text-neutral-700 dark:text-neutral-300  mt-1">
                ({user.email})
              </p>
            )}
          </div>
        ) : (
          <p className="text-lg text-neutral-700 dark:text-neutral-200 font-bold">
            {t("welcome")}
          </p>
        )}
      </div>

      <div className="space-y-4">
        <Button
          variant="green"
          onClick={handlePrimaryAction}
          className="text-lg font-bold disabled:opacity-50 w-full"
          disabled={status === "loading"}
        >
          {isAuthenticated ? (
            <>
              <GameControllerIcon size={24} weight="duotone" /> {t("start")}
            </>
          ) : (
            <>
              <GoogleLogoIcon size={24} weight="duotone" /> {t("signInGoogle")}
            </>
          )}
        </Button>

        <Button
          variant="blue"
          onClick={() => router.push("/leaders")}
          className="text-lg font-bold w-full"
        >
          <TrophyIcon size={24} weight="duotone" /> {t("leader")}
        </Button>

        <Button
          variant="gray"
          className="w-full"
          onClick={() => router.push("/settings")}
        >
          <GearSixIcon size={24} weight="duotone" /> {t("settings")}
        </Button>

        {isAuthenticated && (
          <div className="pt-4 border-t border-black/10 text-base flex gap-2">
            <Button variant="red" onClick={() => signOut()} className="w-full">
              <SignOutIcon size={24} weight="duotone" /> {t("logout")}
            </Button>
          </div>
        )}
      </div>

      <div className="mt-8 text-center text-sm text-neutral-500 dark:text-neutral-400">
        <p>{t("words")}</p>
      </div>
    </Modal>
  );
}
