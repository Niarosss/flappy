import { NextResponse } from "next/server";
import db from "@/lib/Database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");

    // --- Сценарій 1: ОТРИМАННЯ ВСІХ РЕКОРДІВ ОДНОГО ГРАВЦЯ ---
    // Запит: /api/scores?playerId=...
    if (playerId) {
      const [easy, medium, hard] = await Promise.all([
        db.getBestScore({ playerId, difficulty: "easy" }),
        db.getBestScore({ playerId, difficulty: "medium" }),
        db.getBestScore({ playerId, difficulty: "hard" }),
      ]);

      return NextResponse.json(
        {
          easy: easy || 0,
          medium: medium || 0,
          hard: hard || 0,
        },
        { status: 200 }
      );
    }

    // --- Сценарій 2: ОТРИМАННЯ ВСІХ ЛІДЕРБОРДІВ ---
    // Запит: /api/scores
    const allLeaderboards = await db.getTopScores();
    return NextResponse.json(allLeaderboards, { status: 200 });
  } catch (error) {
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
