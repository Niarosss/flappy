import { db } from "@/lib/db_old";

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const playerId = url.searchParams.get("playerId");
    const difficulty = url.searchParams.get("difficulty");

    // Якщо є playerId - повертаємо результати гравця
    if (playerId) {
      if (!playerId) {
        return new Response(JSON.stringify({ error: "playerId required" }), {
          status: 400,
        });
      }

      const bestScores = await db.getPlayerBestScores(
        parseInt(playerId),
        difficulty || null
      );

      return new Response(
        JSON.stringify({
          bestScores,
          bestScore: difficulty
            ? bestScores[difficulty] || 0
            : Math.max(...Object.values(bestScores), 0),
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Якщо немає playerId - повертаємо таблицю лідерів
    const leaderboard = await db.getLeaderboard(difficulty || null);

    return new Response(JSON.stringify(leaderboard), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching scores:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}

export async function POST(req) {
  try {
    const { playerId, score, difficulty, updateForDifficulty } =
      await req.json();

    if (!playerId || score === undefined || score === null) {
      return new Response(
        JSON.stringify({ error: "playerId and score required" }),
        { status: 400 }
      );
    }

    let result;
    if (updateForDifficulty) {
      // Оновлюємо результат для конкретної складності
      result = await db.createScore(
        parseInt(playerId),
        parseInt(score),
        difficulty || "medium"
      );
    } else {
      // Створюємо новий результат
      result = await db.createScore(
        parseInt(playerId),
        parseInt(score),
        difficulty || "medium"
      );
    }

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating score:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
}
