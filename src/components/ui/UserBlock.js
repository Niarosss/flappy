"use client";

import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";

export default function UserBlock({ user }) {
  const t = useTranslations("HomePage");

  if (user) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <p className="text-lg text-neutral-700 dark:text-neutral-200 font-bold mb-2">
          {t("welcomeBack")}
        </p>
        <img
          src={
            user.image ? `/api/image?url=${encodeURIComponent(user.image)}` : ""
          }
          alt={user.name || "User Avatar"}
          className="w-12 h-12 rounded-full object-cover mb-2"
        />
        <p className="text-lg font-semibold text-green-800 dark:text-green-500">
          {user.name || user.email}
        </p>
        {user.email && (
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {user.email}
          </p>
        )}
        <button
          onClick={() => signOut()}
          className="mt-3 px-4 py-1.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition cursor-pointer"
        >
          {t("exit")}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-full">
      <p className="text-lg font-bold text-neutral-700 dark:text-neutral-200">
        {t("welcome")}
      </p>
    </div>
  );
}
