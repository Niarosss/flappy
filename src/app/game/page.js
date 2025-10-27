"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Game from "@/components/Game";

export default function GamePage() {
  const [player, setPlayer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const initPlayer = async () => {
      const currentPlayer =
        sessionStorage.getItem("currentPlayer") ||
        localStorage.getItem("currentPlayer");

      if (!currentPlayer) {
        router.push("/");
        return;
      }

      try {
        const playerData = JSON.parse(currentPlayer);

        if (!playerData.nickname) throw new Error("Invalid player data");

        if (!playerData.id) {
          // Створюємо гравця на сервері
          const res = await fetch("/api/players", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ nickname: playerData.nickname }),
          });
          const newPlayer = await res.json();
          if (!res.ok)
            throw new Error(newPlayer.error || "Failed to create player");

          playerData.id = newPlayer.id;
          sessionStorage.setItem("currentPlayer", JSON.stringify(playerData));
        }

        setPlayer(playerData);
      } catch (e) {
        console.error("Error initializing player:", e);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    initPlayer();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-3xl font-extrabold text-white animate-pulse text-shadow-2xs">
          Loading game...
        </p>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-3xl font-extrabold text-white animate-pulse text-shadow-2xs">
          No player data found
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Game player={player} />
    </div>
  );
}
