"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  GameControllerIcon,
  TrophyIcon,
  GearSixIcon,
  SignOutIcon,
  BirdIcon,
} from "@phosphor-icons/react";

export default function HomePage() {
  const [player, setPlayer] = useState(null);
  const [showNicknameInput, setShowNicknameInput] = useState(false);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations("HomePage");

  useEffect(() => {
    const loadPlayer = async () => {
      try {
        // Спочатку перевіряємо сховища браузера
        const sessionPlayer = sessionStorage.getItem("currentPlayer");
        const localPlayer = localStorage.getItem("currentPlayer");

        const currentPlayer = sessionPlayer || localPlayer;
        console.log(
          "HomePage: Found player data in storage:",
          currentPlayer ? "yes" : "no"
        );

        if (currentPlayer) {
          const playerData = JSON.parse(currentPlayer);
          console.log("HomePage: Player data from storage:", playerData);

          // Перевіряємо валідність даних
          if (playerData && playerData.id && playerData.nickname) {
            // ВАЖЛИВО: Перевіряємо, чи гравець існує в базі даних
            try {
              console.log("🔍 Checking if player exists in database...");
              const response = await fetch(`/api/players?id=${playerData.id}`);

              if (response.ok) {
                const dbPlayer = await response.json();
                console.log("✅ Player exists in database:", dbPlayer);
                setPlayer(playerData);

                // Якщо дані були тільки в localStorage, зберігаємо і в sessionStorage
                if (!sessionPlayer && localPlayer) {
                  sessionStorage.setItem("currentPlayer", localPlayer);
                }
              } else {
                // Гравець не знайдений в базі - очищаємо сховища
                console.warn(
                  "❌ Player not found in database, clearing storage"
                );
                clearPlayerStorage();
              }
            } catch (error) {
              console.error(
                "HomePage: Error checking player in database:",
                error
              );
              // У разі помилки мережі все одно показуємо гравця
              setPlayer(playerData);
            }
          } else {
            // Видаляємо невалідні дані
            console.warn("HomePage: Invalid player data, clearing storage");
            clearPlayerStorage();
          }
        }
      } catch (error) {
        console.error("HomePage: Error loading player:", error);
        clearPlayerStorage();
      }
    };

    loadPlayer();
  }, []);

  const syncPlayerWithDatabase = async (playerData) => {
    try {
      // Перевіряємо чи гравець існує в базі
      const response = await fetch(`/api/players?id=${playerData.id}`);
      if (!response.ok) {
        // Гравець не знайдений - створюємо заново
        console.log("Player not found in DB, recreating...");
        const createResponse = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: playerData.nickname }),
        });

        if (createResponse.ok) {
          const newPlayer = await createResponse.json();
          console.log("Player recreated:", newPlayer);

          // Оновлюємо сховища
          const newPlayerData = JSON.stringify(newPlayer);
          sessionStorage.setItem("currentPlayer", newPlayerData);
          localStorage.setItem("currentPlayer", newPlayerData);
          setPlayer(newPlayer);

          return newPlayer;
        }
      }
      return playerData;
    } catch (error) {
      console.error("Error syncing player with database:", error);
      return playerData;
    }
  };

  const clearPlayerStorage = () => {
    sessionStorage.removeItem("currentPlayer");
    localStorage.removeItem("currentPlayer");
    setPlayer(null);
  };

  const handleStartGame = async () => {
    if (player) {
      // Синхронізуємо гравця з базою даних
      const syncedPlayer = await syncPlayerWithDatabase(player);
      console.log("Starting game for player:", syncedPlayer);
      router.push("/game");
    } else {
      console.log("HomePage: No player, showing nickname input");
      setShowNicknameInput(true);
    }
  };

  const handleSubmitNickname = async (e) => {
    e.preventDefault();
    setError("");

    const trimmedNickname = nickname.trim();
    if (!trimmedNickname) {
      setError("Please enter a nickname");
      return;
    }

    if (trimmedNickname.length < 2 || trimmedNickname.length > 20) {
      setError("Nickname must be between 2 and 20 characters");
      return;
    }

    setIsLoading(true);

    try {
      console.log("HomePage: Creating player with nickname:", trimmedNickname);

      const response = await fetch("/api/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nickname: trimmedNickname }),
      });

      console.log("HomePage: Response status:", response.status);

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error("HomePage: Failed to parse JSON response:", parseError);
        throw new Error("Server returned invalid response");
      }

      if (response.ok) {
        console.log("HomePage: Player created successfully:", data);

        // Зберігаємо гравця в обидва сховища
        const playerData = JSON.stringify(data);
        sessionStorage.setItem("currentPlayer", playerData);
        localStorage.setItem("currentPlayer", playerData);
        setPlayer(data);

        // Переходимо в гру
        router.push("/game");
      } else {
        console.error("HomePage: Failed to create player:", data);

        if (response.status === 409) {
          setError(
            "This nickname is already taken. Please choose another one."
          );
        } else {
          setError(data.error || `Error: ${response.status}`);
        }
      }
    } catch (error) {
      console.error("HomePage: Registration error:", error);
      setError(error.message || "Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    console.log("HomePage: Logging out player");
    clearPlayerStorage();
    setShowNicknameInput(false);
    setNickname("");
    setError("");
  };

  const handleCancelNickname = () => {
    setShowNicknameInput(false);
    setNickname("");
    setError("");
  };

  return (
    <Modal className="max-w-md text-center">
      <div className="mb-2 flex items-center justify-center gap-2 ">
        <BirdIcon size={48} weight="duotone" className="text-yellow-700/50" />
        <h1 className="text-5xl text-cyan-950/50 font-extrabold drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
          Flappy Bird
        </h1>
      </div>
      <p className="text-neutral-500 mb-8">{t("title")}</p>
      <div className="mb-8">
        {player ? (
          <div>
            <p className="text-lg text-neutral-600 mb-2">{t("welcomeBack")}</p>
            <p className="text-xl font-semibold text-green-500 ">
              {player.nickname}
            </p>
          </div>
        ) : (
          <p className="text-lg text-neutral-700">{t("welcome")}</p>
        )}
      </div>

      <div className="space-y-4">
        {!showNicknameInput ? (
          <Button
            variant="green"
            onClick={handleStartGame}
            disabled={isLoading}
            className="text-lg font-bold disabled:opacity-50 w-full"
          >
            <GameControllerIcon size={24} weight="duotone" />{" "}
            {player ? t("start") : t("startNew")}
          </Button>
        ) : (
          <form
            onSubmit={handleSubmitNickname}
            className="bg-white/5 p-5 rounded-xl border border-white/10 backdrop-blur-sm"
          >
            <label className="block text-sm font-medium text-neutral-600 mb-2">
              Enter your nickname:
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              placeholder="Your nickname..."
              disabled={isLoading}
              autoFocus
              className="w-full px-4 py-3 rounded-xl bg-black/5 text-neutral-900 border border-white/20 focus:ring-2 focus:ring-blue-500 outline-none transition-all mb-3"
            />

            {error && (
              <div className="mb-3 p-3 bg-red-900/40 border border-red-500/10 text-red-100 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="green"
                type="submit"
                disabled={
                  isLoading || !nickname.trim() || nickname.trim().length < 2
                }
                className="flex-1 disabled:opacity-30"
              >
                {isLoading ? "Creating..." : "Start"}
              </Button>
              <Button
                variant="gray"
                type="button"
                onClick={handleCancelNickname}
                disabled={isLoading}
                className="flex-1 disabled:opacity-30"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        <Button
          variant="blue"
          onClick={() => router.push("/leaders")}
          className="text-lg font-bold w-full"
        >
          <TrophyIcon size={24} weight="duotone" /> {t("leader")}
        </Button>

        {player && (
          <div className="pt-4 border-t border-black/10 text-base flex gap-2">
            <Button variant="red" onClick={handleLogout} className="w-full">
              <SignOutIcon size={24} weight="duotone" /> {t("logout")}
            </Button>
          </div>
        )}
        <Button
          variant="gray"
          className="w-full"
          onClick={() => router.push("/settings")}
        >
          <GearSixIcon size={24} weight="duotone" /> {t("settings")}
        </Button>
      </div>

      <div className="mt-8 text-center text-sm text-neutral-500">
        <p>{t("words")}</p>
      </div>
    </Modal>
  );
}
