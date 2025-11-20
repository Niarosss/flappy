"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Game from "@/components/GamePageClient";

export default function GamePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const isLoading = status === "loading";
  const isAuthenticated = status === "authenticated";

  /**
   * Обробляє збереження результату гри, викликаючи API.
   * Ця функція передається в компонент <Game /> як проп onGameOver.
   * @param {number} score - Фінальний або проміжний результат гри.
   * @param {string} difficulty - Обраний рівень складності.
   */
  const handleScoreSubmission = useCallback(
    async (score, difficulty = "medium") => {
      try {
        if (!session?.user?.id) {
          console.error("User ID is missing in session. Cannot save score.");
          return;
        }

        const payload = {
          playerId: session.user.id,
          score: Number(score),
          difficulty: difficulty,
        };

        const res = await fetch("/api/scores", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(
            errorData.error ||
              `Failed to save score on server (Status: ${res.status}).`
          );
        }
      } catch (e) {
        console.error("Score saving error:", e.message);
      }
    },
    [session]
  );

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-3xl font-extrabold text-white animate-pulse p-4">
          Завантаження сесії користувача...
        </p>
      </div>
    );
  }

  if (isAuthenticated && session?.user) {
    const player = {
      id: session.user.id,
      name: session.user.name,
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <Game player={player} onGameOver={handleScoreSubmission} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-3xl font-extrabold text-white">
        Доступ заборонено. Перенаправлення...
      </p>
    </div>
  );
}
