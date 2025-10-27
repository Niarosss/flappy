import NextAuth from "next-auth";
// import FacebookProvider from "next-auth/providers/facebook";
import GoogleProvider from "next-auth/providers/google";
import { DrizzleAdapter } from "@auth/drizzle-adapter"; // Імпортуємо адаптер
import { db } from "@/lib/db"; // Імпортуємо ваш Drizzle клієнт
import * as schema from "@/lib/schema"; // Імпортуємо вашу схему

export const authOptions = {
  adapter: DrizzleAdapter(db, {
    usersTable: schema.users,
    accountsTable: schema.accounts,
    sessionsTable: schema.sessions,
    // Якщо ви використовуєте таблицю верифікації email, додайте її тут:
    // verificationTokensTable: schema.verificationTokens,
  }),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_ID,
    //   clientSecret: process.env.FACEBOOK_SECRET,
    // }),
  ],
  secret: process.env.NEXTAUTH_SECRET, // Додайте секретний ключ
  session: {
    strategy: "jwt", // Рекомендовано для App Router
  },
  // Додаткові опції, якщо потрібні:
  // callbacks: { ... },
  // pages: { ... },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
