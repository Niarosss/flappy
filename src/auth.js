import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    // ВИПРАВЛЕННЯ: У "database" стратегії callback отримує `user`, а не `token`.
    async session({ session, user }) {
      // `user` - це об'єкт користувача з вашої бази даних.
      // Додаємо ID користувача до стандартного об'єкта сесії.
      // `session.user` за замовчуванням вже містить name, email та image.
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
  },
});
