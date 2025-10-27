"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  if (session) {
    return (
      <main className="p-10 text-center z-50">
        <h1>Вітаю, {session.user.name}</h1>
        <img
          src={session.user.image}
          alt="avatar"
          className="w-20 h-20 rounded-full mx-auto my-4"
        />
        <button
          onClick={() => signOut()}
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Вийти
        </button>
      </main>
    );
  }

  return (
    <main className="p-10 text-center z-50">
      <h1>Увійти</h1>
      <div className="flex gap-4 justify-center mt-6">
        <button
          onClick={() => signIn("google", { callbackUrl: "/" })}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Google
        </button>
        <button
          onClick={() => signIn("facebook")}
          className="bg-blue-700 text-white px-4 py-2 rounded"
        >
          Facebook
        </button>
      </div>
    </main>
  );
}
