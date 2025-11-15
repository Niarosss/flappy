import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import prisma from "@/lib/prisma";
import Google from "next-auth/providers/google";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [Google],
  callbacks: {
    // 1. JWT Callback: Додає ID користувача до JWT при вході
    async jwt({ token, user }) {
      if (user) {
        // 'user' доступний лише під час першого входу/оновлення сесії
        // 'user.id' тут береться з адаптера (бази даних)
        token.id = user.id;
      }
      return token;
    },

    // 2. Session Callback: Додає ID з JWT до об'єкта 'session'
    async session({ session, token }) {
      if (token) {
        // Беремо ID з токена, який ми встановили вище
        session.user.id = token.id;
      }
      return session;
    },
  },
});
