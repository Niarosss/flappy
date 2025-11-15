import { NextResponse } from "next/server";
import { routing } from "@/i18n/routing";
import { auth } from "@/auth";

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

export async function proxy(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // 1. ПЕРЕВІРКА/ОНОВЛЕННЯ СЕСІЇ AUTH.JS
  // Запускаємо Auth.js middleware. Якщо це API запит Auth.js, він його обробить.
  // Цей виклик оновить сесію і захистить /api/auth/* маршрути.
  const authResponse = await auth((req) => NextResponse.next())(request);

  // Якщо Auth.js обробив запит (наприклад, вхід/вихід), повертаємо його відповідь
  if (
    authResponse.status !== 200 ||
    authResponse.headers.get("x-middleware-next")
  ) {
    // Якщо це запит, який повинен обробити сам Auth.js, повертаємо його
    // Ця перевірка може бути складною; простішим варіантом є перевірка маршруту.
    if (pathname.startsWith("/api/auth")) {
      return authResponse;
    }
  }

  // 2. ВЛАСНА ЛОГІКА ПРОКСІ/ЛОКАЛІЗАЦІЇ

  // НЕ робимо редирект для API, внутрішніх ресурсів, статичних файлів і non-GET запитів
  if (
    // Тепер виключаємо Auth.js маршрути з вашої логіки локалізації
    pathname.startsWith("/api/auth") || // [!code focus] Додано виняток для Auth.js
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".") ||
    request.method !== "GET"
  ) {
    return NextResponse.next();
  }

  // ... (Ваша логіка локалізації залишається без змін) ...

  const cookie = request.cookies.get(COOKIE_NAME)?.value;
  if (!cookie) {
    const acceptLang = request.headers.get("accept-language") || "";
    const matched =
      findMatchingLocale(acceptLang, routing.locales) || routing.defaultLocale;

    const response = NextResponse.redirect(url);
    response.cookies.set(COOKIE_NAME, matched, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  return NextResponse.next();
}
