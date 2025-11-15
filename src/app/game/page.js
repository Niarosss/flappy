"use client";
import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Game from "@/components/Game";

export default function GamePage() {
  // Отримання сесії та статусу автентифікації
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
        // 1. Перевірка наявності ID користувача
        if (!session?.user?.id) {
          console.error("User ID is missing in session. Cannot save score.");
          return;
        }

        const payload = {
          playerId: session.user.id, // ID користувача, отриманий з Auth.js
          score: Number(score),
          difficulty: difficulty,
        };

        console.log("Submitting score payload:", payload);

        // 2. Виклик API для збереження результату (POST /api/scores)
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

        console.log("Score successfully saved:", await res.json());
      } catch (e) {
        console.error("Score saving error:", e.message);
        // У реальному додатку тут можна відобразити спливаюче повідомлення про помилку
      }
    },
    [session]
  ); // Залежність від об'єкта сесії гарантує коректне використання ID користувача

  // Ефект для редиректу: якщо користувач не автентифікований, перенаправляємо на головну
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isLoading, isAuthenticated, router]);

  // Стан завантаження сесії
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-3xl font-extrabold text-white animate-pulse">
          Завантаження сесії користувача...
        </p>
      </div>
    );
  }

  // Якщо користувач автентифікований, рендеримо гру
  if (isAuthenticated && session?.user) {
    const player = {
      id: session.user.id,
      name: session.user.name,
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        {/* ПЕРЕДАЄМО ФУНКЦІЮ handleScoreSubmission ЯК ПРОП onGameOver */}
        <Game player={player} onGameOver={handleScoreSubmission} />
      </div>
    );
  }

  // Запасний варіант, якщо редирект ще не відбувся
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <p className="text-3xl font-extrabold text-white">
        Доступ заборонено. Перенаправлення...
      </p>
    </div>
  );
}
