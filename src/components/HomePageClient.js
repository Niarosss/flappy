"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  GameControllerIcon,
  TrophyIcon,
  GearSixIcon,
  BirdIcon,
  GoogleLogoIcon,
  GithubLogoIcon,
  InfoIcon,
  XIcon,
  SignInIcon,
} from "@phosphor-icons/react";
import { useSession, signIn } from "next-auth/react";
import UserBlock from "@/components/ui/UserBlock";
import { AnimatePresence, motion } from "motion/react";

const providers = {
  google: <GoogleLogoIcon size={24} weight="duotone" />,
  github: <GithubLogoIcon size={24} weight="duotone" />,
};

export default function HomePageClient({ session: initialSession }) {
  const { status } = useSession();
  const t = useTranslations("HomePage");
  const router = useRouter();

  const isAuthed = !!initialSession;
  const user = initialSession?.user;

  const isLoading = status === "loading";

  const [showAuthOptions, setShowAuthOptions] = useState(false);

  return (
    <Modal className="max-w-md text-center p-6">
      <div className="mb-4 flex justify-center items-center gap-2 md:gap-3">
        <BirdIcon
          size={56}
          weight="duotone"
          className="text-yellow-700/50 dark:text-yellow-500/50"
        />
        <h1 className="md:text-5xl text-4xl font-extrabold text-cyan-950/60 dark:text-cyan-400/60 drop-shadow-sm">
          Flappy Bird
        </h1>
      </div>
      <p className="text-neutral-600 dark:text-neutral-300 mb-6">
        {t("title")}
      </p>

      <div className="mb-4 ">
        <UserBlock user={user} />
      </div>
      <motion.div layout>
        {isAuthed ? (
          <Button
            variant="green"
            onClick={() => router.push("/game")}
            disabled={isLoading}
            className="text-lg font-bold w-full animate-pulse"
          >
            <GameControllerIcon size={24} weight="duotone" />
            {t("start")}
          </Button>
        ) : (
          <>
            <Button
              variant="green"
              onClick={() => setShowAuthOptions(true)}
              disabled={isLoading || showAuthOptions}
              className={`text-lg w-full transition-all duration-200 ${
                showAuthOptions ? "rounded-b-none" : ""
              }`}
            >
              {showAuthOptions ? (
                <>
                  <SignInIcon size={24} weight="duotone" />
                  {t("signInToPlay")}
                </>
              ) : (
                <>
                  <GameControllerIcon size={24} weight="duotone" />
                  {t("start")}
                </>
              )}
            </Button>

            <AnimatePresence>
              {showAuthOptions && (
                <motion.div
                  key="auth-options"
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <div className="p-4 border border-t-0 border-neutral-300/50 dark:border-neutral-600/50 rounded-xl rounded-t-none bg-neutral-200/20 dark:bg-neutral-800/20">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {Object.entries(providers).map(([id, icon]) => (
                        <Button
                          key={id}
                          variant="gray"
                          className="w-full justify-center"
                          onClick={() => signIn(id)}
                          disabled={isLoading}
                        >
                          {icon}
                          <span className="capitalize">{id}</span>
                        </Button>
                      ))}
                      <Button
                        key="close"
                        variant="red"
                        onClick={() => setShowAuthOptions(false)}
                        disabled={isLoading}
                      >
                        <XIcon size={18} />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}

        <Button
          variant="blue"
          className="text-lg font-bold w-full my-4"
          onClick={() => router.push("/leaders")}
        >
          <TrophyIcon size={24} weight="duotone" />
          {t("leader")}
        </Button>
        <div className="flex gap-4">
          <Button
            variant="gray"
            className="w-full "
            onClick={() => router.push("/settings")}
          >
            <GearSixIcon size={24} weight="duotone" />
            {t("settings")}
          </Button>
          <Button variant="gray" onClick={() => router.push("/help")}>
            <InfoIcon size={24} weight="duotone" />
            <span className="hidden sm:ml-2 sm:inline">{t("help")}</span>
          </Button>
        </div>
      </motion.div>
      <div className="mt-4 pt-4 border-t border-neutral-300/30 dark:border-neutral-600/30 text-center text-sm text-neutral-600 dark:text-neutral-400">
        <p>{t("words")}</p>
      </div>
    </Modal>
  );
}
