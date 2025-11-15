"use client";
import { useState, useEffect } from "react";
import { ArrowsClockwiseIcon } from "@phosphor-icons/react";
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
      const response = await fetch(url);

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);

      const data = await response.json();

      // Новий формат строго визначений
      setScores(data.leaderboard ?? []);
    } catch (err) {
      setError(err.message);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="relative flex flex-col items-center justify-center">
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
    <Modal className="max-w-2xl text-center">
      <h2 className="text-5xl font-bold text-slate-900 dark:text-slate-50 mb-10">
        {t("title")}
      </h2>

      <div className="mb-6 flex flex-col items-center gap-4">
        <div className="flex gap-2 flex-wrap justify-center">
          {["easy", "medium", "hard"].map((level) => (
            <Button
              key={level}
              onClick={() => setSelectedDifficulty(level)}
              variant={selectedDifficulty === level ? "green" : "gray"}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
          <Button onClick={fetchScores} variant="blue">
            <ArrowsClockwiseIcon size={16} weight="duotone" />
          </Button>
        </div>
      </div>

      <div className="bg-white/10 rounded-xl overflow-hidden">
        <table className="w-full table-fixed border-collapse">
          <thead>
            <tr className="bg-gray-100/20 text-gray-700 dark:text-gray-200 text-center font-semibold">
              <th className="w-1/12 px-4 py-3">{t("rank")}</th>
              <th className="w-5/12 px-4 py-3">{t("player")}</th>
              <th className="w-2/12 px-4 py-3">{t("score")}</th>
              <th className="w-2/12 px-4 py-3">{t("difficulty")}</th>
              <th className="w-2/12 px-4 py-3">{t("date")}</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr className="h-32">
                <td
                  colSpan="5"
                  className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center"
                >
                  {t("loading")}
                </td>
              </tr>
            ) : scores.length > 0 ? (
              scores.map((record, index) => {
                const nickname = record.player?.name ?? "Unknown";
                const score = record.score;
                const difficulty = record.difficulty;
                const date = record.createdAt;

                return (
                  <tr
                    key={record.id}
                    className={
                      index % 2 === 0 ? "bg-gray-50/10" : "bg-white/20"
                    }
                  >
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full font-bold
                          ${
                            index === 0
                              ? "bg-yellow-100/30 text-yellow-800"
                              : index === 1
                              ? "bg-gray-100/30 text-gray-800"
                              : index === 2
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-50 text-blue-800"
                          }`}
                      >
                        {index + 1}
                      </span>
                    </td>

                    <td className="px-4 py-3 font-medium text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        {record.player?.image ? (
                          <img
                            src={record.player.image}
                            alt={nickname}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200" />
                        )}

                        <span className="whitespace-nowrap">{nickname}</span>
                      </div>
                    </td>

                    <td className="px-4  py-3 text-lg font-bold text-gray-600 dark:text-gray-400">
                      {score}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold
                          ${
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

                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                      {date ? new Date(date).toLocaleDateString() : "—"}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr className="h-32">
                <td
                  colSpan="5"
                  className="px-4 py-3 text-gray-600 dark:text-gray-400 text-center"
                >
                  {t("noScores", { selectedDifficulty })}
                  <br />
                  <span className="text-sm">{t("motivation")}</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};

export default Leaderboard;
