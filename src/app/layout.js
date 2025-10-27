import { Nunito } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale } from "next-intl/server";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { GameStatusProvider } from "@/context/GameStatusContext";
import Background from "@/components/Background";
import "./globals.css";

const nunito = Nunito({
  subsets: ["cyrillic", "latin"],
  weight: ["400", "700", "900"],
  display: "swap",
});

export const metadata = {
  title: "Flappy Bird Game",
  description: "Flappy Bird game built with Next.js",
};

export default async function RootLayout({ children }) {
  const locale = await getLocale();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={nunito.className}>
        <NextIntlClientProvider>
          <GameStatusProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <Background />

              {children}
            </ThemeProvider>
          </GameStatusProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
