"use server";

import { cookies } from "next/headers";
import { routing } from "@/i18n/routing";

const COOKIE_NAME = "NEXT_LOCALE";

export async function getUserLocale() {
  const allCookies = await cookies();
  const localeCookie = allCookies.get(COOKIE_NAME);

  if (localeCookie?.value && routing.locales.includes(localeCookie.value)) {
    return localeCookie.value;
  }
}

export async function setUserLocale(locale) {
  (await cookies()).set(COOKIE_NAME, locale);
}
