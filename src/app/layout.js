import { Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { GameProvider } from "@/context/GameContext";
import Background from "@/components/game/Background";

import "./globals.css";

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "Flappy Bird Game",
  description: "Flappy Bird game built with Next.js",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  manifest: "/site.webmanifest",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={nunito.className}>
        <NextIntlClientProvider>
          <GameProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Background />
              <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>
          </GameProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
