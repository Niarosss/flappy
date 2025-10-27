"use client";
import { useState, useEffect } from "react";
import {
  ArrowsClockwiseIcon,
  BugIcon,
  PlusCircleIcon,
  BroomIcon,
} from "@phosphor-icons/react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { useTranslations } from "next-intl";

const Leaderboard = () => {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("medium");
  const t = useTranslations("LeaderPage");

  useEffect(() => {
    fetchScores();
  }, [selectedDifficulty]);

  const fetchScores = async () => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/scores?difficulty=${selectedDifficulty}`;

      console.log("Fetching leaderboard from URL:", url);

      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Received leaderboard data:", data);

      let scoresData = [];

      if (Array.isArray(data)) {
        scoresData = data;
      } else if (data.leaderboard && Array.isArray(data.leaderboard)) {
        scoresData = data.leaderboard;
      } else if (data.scores && Array.isArray(data.scores)) {
        scoresData = data.scores;
      }

      setScores(scoresData);
    } catch (error) {
      console.error("Error fetching scores:", error);
      setError(error.message);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  // Функція для створення тестових даних (для розробки)
  const createTestData = async () => {
    try {
      const testPlayers = [
        { nickname: "SuperPlayer", scores: [15, 12, 8] },
        { nickname: "BirdMaster", scores: [22, 18, 10] },
        { nickname: "FlappyKing", scores: [30, 25, 15] },
        { nickname: "PipeDodger", scores: [18, 14, 9] },
        { nickname: "Newbie", scores: [5, 3, 1] },
      ];

      for (const player of testPlayers) {
        // Створюємо гравця
        const playerResponse = await fetch("/api/players", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nickname: player.nickname }),
        });

        if (playerResponse.ok) {
          const playerData = await playerResponse.json();

          // Створюємо результати для різних складностей
          const difficulties = ["easy", "medium", "hard"];
          for (let i = 0; i < difficulties.length; i++) {
            await fetch("/api/scores", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                playerId: playerData.id,
                score: player.scores[i],
                difficulty: difficulties[i],
              }),
            });
          }
        }
      }

      alert("Test data created!");
      fetchScores();
    } catch (error) {
      console.error("Error creating test data:", error);
    }
  };

  if (error) {
    return (
      <div className=" relative flex flex-col items-center justify-center">
        <div className="bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl mb-4">
          <p>
            {t("error")} {error}
          </p>
        </div>
        <Button variant="blue" onClick={fetchScores}>
          <ArrowsClockwiseIcon size={24} weight="duotone" />
          {t("tryAgain")}
        </Button>
      </div>
    );
  }

  return (
    <Modal className="max-w-xl text-center">
      <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-10">
        {t("title")}
      </h2>

      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="flex gap-2 flex-wrap justify-center">
          {["easy", "medium", "hard"].map((level) => (
            <Button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              variant={`${selectedDifficulty === level ? "green" : "gray"}`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
          <Button onClick={fetchScores} variant="blue">
            <ArrowsClockwiseIcon size={16} weight="duotone" />
          </Button>
        </div>
      </div>

      <div className="bg-white/30 rounded-xl overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead className="rounded-xl">
            <tr className="bg-gray-100/30">
              <th className="w-2/12 px-4 py-3 text-center font-semibold text-gray-700">
                {t("rank")}
              </th>
              <th className="w-3/12 px-4 py-3 text-center font-semibold text-gray-700">
                {t("player")}
              </th>
              <th className="w-3/12 px-4 py-3 text-center font-semibold text-gray-700">
                {t("score")}
              </th>
              <th className="w-3/12 px-4 py-3 text-center font-semibold text-gray-700">
                {t("difficulty")}
              </th>
              <th className="w-3/12 px-4 py-3 text-center font-semibold text-gray-700">
                {t("date")}
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="h-32">
                <td
                  colSpan="5"
                  rowSpan="2"
                  className="px-6 py-4 text-gray-600 text-center"
                >
                  {t("loading")}
                </td>
              </tr>
            ) : scores.length > 0 ? (
              scores.map((score, index) => {
                // Адаптуємося до різних форматів даних
                const playerName =
                  score.player?.nickname ||
                  score.player?.name ||
                  score.nickname ||
                  "Unknown Player";

                const playerScore = score.score || score.maxScore || 0;
                const difficulty = score.difficulty || selectedDifficulty;
                const date = score.createdAt || score.created_at || score.date;

                return (
                  <tr
                    key={score.id || `score-${index}`}
                    className={
                      index % 2 === 0 ? "bg-gray-50/10" : "bg-white/30"
                    }
                  >
                    <td className="px-6 py-4 text-gray-800">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          index === 0
                            ? "bg-yellow-100/30 text-yellow-800"
                            : index === 1
                            ? "bg-gray-100/30 text-gray-800"
                            : index === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-blue-50 text-blue-800"
                        } font-bold`}
                      >
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-medium">
                      {playerName}
                    </td>
                    <td className="px-6 py-4 text-gray-800 font-bold text-lg">
                      {playerScore}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          difficulty === "easy"
                            ? "bg-green-100/30 text-green-800"
                            : difficulty === "medium"
                            ? "bg-yellow-100/30 text-yellow-800"
                            : "bg-red-100/30 text-red-800"
                        }`}
                      >
                        {difficulty}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {date ? new Date(date).toLocaleDateString() : "N/A"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="h-32">
                <td
                  colSpan="5"
                  rowSpan="2"
                  className="px-6 py-4 text-gray-500 text-center"
                >
                  {t("noScores", { selectedDifficulty: selectedDifficulty })}
                  <br />
                  <span className="text-sm">{t("motivation")}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Додаткова інформація для дебагу */}
      {process.env.NODE_ENV === "development" && (
        <>
          <div className="flex gap-2 flex-wrap justify-center mt-4">
            <Button
              onClick={async () => {
                try {
                  console.log("=== DEBUG STORAGE INFO ===");

                  // Перевіряємо сховища браузера
                  const sessionPlayer = sessionStorage.getItem("currentPlayer");
                  const localPlayer = localStorage.getItem("currentPlayer");
                  console.log("Session storage player:", sessionPlayer);
                  console.log("Local storage player:", localPlayer);

                  if (sessionPlayer || localPlayer) {
                    const playerData = JSON.parse(sessionPlayer || localPlayer);
                    console.log("Current player from storage:", playerData);

                    // Перевіряємо чи гравець є в базі
                    if (playerData?.id) {
                      const playerResponse = await fetch(
                        `/api/players?id=${playerData.id}`
                      );
                      console.log("Player exists in DB:", playerResponse.ok);
                    }
                  }

                  // Тестуємо API debug
                  const debugResponse = await fetch("/api/debug?action=info");
                  const debugData = await debugResponse.json();
                  console.log("Debug API response:", debugData);

                  alert("Check console for debug info");
                } catch (error) {
                  console.error("Debug error:", error);
                  alert("Debug error: " + error.message);
                }
              }}
              variant="purple"
              className="text-sm"
            >
              <BugIcon size={24} weight="duotone" />
              {t("debug")}
            </Button>

            <Button
              onClick={createTestData}
              variant="green"
              className="text-sm"
            >
              <PlusCircleIcon size={24} weight="duotone" />
              {t("createTestData")}
            </Button>

            <Button
              onClick={async () => {
                if (
                  confirm(
                    "Clear all data? This will remove all players and scores."
                  )
                ) {
                  try {
                    console.log("🧹 Sending clear request...");

                    const response = await fetch("/api/debug", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        action: "clear",
                      }),
                    });

                    const result = await response.json();
                    console.log("Clear result:", result);

                    if (result.success) {
                      alert("Data cleared successfully!");
                      fetchScores();
                    } else {
                      alert(
                        "Failed to clear data: " +
                          (result.error || "Unknown error")
                      );
                    }
                  } catch (error) {
                    console.error("Error clearing data:", error);
                    alert("Error clearing data: " + error.message);
                  }
                }
              }}
              variant="red"
              className="text-sm"
            >
              <BroomIcon size={24} weight="duotone" />

              {t("clear")}
            </Button>
          </div>
          <div className="mt-4 p-4 bg-gray-800 rounded-xl">
            <details className="text-white text-left text-sm">
              <summary className="cursor-pointer font-semibold">
                {t("debugInfo")}
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>API URL:</strong> /api/scores?difficulty=
                  {selectedDifficulty}
                </div>
                <div>
                  <strong>Scores count:</strong> {scores.length}
                </div>
                <pre className="text-xs bg-gray-900 p-2 rounded overflow-auto max-h-40">
                  {JSON.stringify(scores, null, 2)}
                </pre>
              </div>
            </details>
          </div>
        </>
      )}
    </Modal>
  );
};

export default Leaderboard;
