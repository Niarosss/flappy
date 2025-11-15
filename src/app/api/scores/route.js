import { NextResponse } from "next/server";
import db from "@/lib/Database";

/**
 * GET: Отримує найкращий результат для конкретного гравця (playerId + difficulty)
 * АБО отримує Топ-10 для рівня складності (лише difficulty).
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const difficulty = searchParams.get("difficulty");

    // Перевірка на відсутність difficulty, що призводило б до 400, але
    // у вашому лозі difficulty=medium завжди присутній.
    if (!difficulty) {
      return NextResponse.json(
        { error: "Missing required parameter: difficulty" },
        { status: 400 } // Bad Request
      );
    }

    // --- ЛОГІКА ДЛЯ ОТРИМАННЯ ОДНОГО РЕЗУЛЬТАТУ ГРАВЦЯ (З Game.js) ---
    if (playerId) {
      console.log(
        `[DB] Fetching single score for Player: ${playerId}, Difficulty: ${difficulty}`
      );
      const bestScoreValue = await db.getBestScore({ playerId, difficulty });

      return NextResponse.json(
        { bestScore: bestScoreValue || 0 }, // Повертаємо 0, якщо не знайдено
        { status: 200 }
      );
    }

    // --- ЛОГІКА ДЛЯ ОТРИМАННЯ ТОП-10 (З Leaderboard.js - ВИПРАВЛЯЄ ПОМИЛКУ 400) ---
    else {
      // Якщо playerId відсутній, очікуємо запит на Leaderboard
      console.log(`[DB] Fetching top 10 scores for Difficulty: ${difficulty}`);
      const topScores = await db.getTopScores(difficulty);

      // Leaderboard.js очікує об'єкт { leaderboard: [...] }
      return NextResponse.json({ leaderboard: topScores }, { status: 200 });
    }
  } catch (error) {
    // Покращена обробка 500 помилки
    console.error(
      "API Error in GET /api/scores (Internal DB Fail):",
      error.message
    );

    return NextResponse.json(
      {
        error: `Internal Server Error: Database access failed. Check server logs for details. Reason: ${error.message}`,
      },
      { status: 500 }
    );
  }
}

/**
 * POST: Зберігає або оновлює результат гри.
 */
export async function POST(request) {
  try {
    const { playerId, score, difficulty } = await request.json();

    if (!playerId || score === undefined || !difficulty) {
      return NextResponse.json(
        { error: "Missing required fields (playerId, score, difficulty)" },
        { status: 400 }
      );
    }

    const updatedRecord = await db.saveOrUpdateScore({
      playerId,
      score,
      difficulty,
    });

    return NextResponse.json(
      { success: true, record: updatedRecord },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "API Error in POST /api/scores (Internal DB Fail):",
      error.message
    );
    return NextResponse.json(
      {
        error: `Internal Server Error: Database access failed. Check server logs for details. Reason: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
