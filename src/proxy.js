import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";

const COOKIE_NAME = "NEXT_LOCALE";

function parseAcceptLanguage(header = "") {
  return header
    .split(",")
    .map((part) => {
      const [langPart, qPart] = part.split(";");
      const lang = (langPart || "").trim().toLowerCase();
      const q =
        qPart && qPart.includes("=") ? parseFloat(qPart.split("=")[1]) : 1;
      return { lang, base: lang.split("-")[0], q: isNaN(q) ? 0 : q };
    })
    .filter(Boolean)
    .sort((a, b) => b.q - a.q);
}

function findMatchingLocale(acceptLanguageHeader, supportedLocales) {
  const prefs = parseAcceptLanguage(acceptLanguageHeader);

  for (const { lang, base } of prefs) {
    if (supportedLocales.includes(lang)) return lang;
    if (supportedLocales.includes(base)) return base;
  }

  return null;
}

export function proxy(request) {
  const cookie = request.cookies.get(COOKIE_NAME)?.value;

  if (!cookie) {
    const acceptLang = request.headers.get("accept-language") || "";
    const matched =
      findMatchingLocale(acceptLang, routing.locales) || routing.defaultLocale;

    const url = new URL(request.url);
    const response = NextResponse.redirect(url);

    response.cookies.set(COOKIE_NAME, matched, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  }

  return NextResponse.next();
}
