import { NextResponse } from "next/server";
import db from "@/lib/Database";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const playerId = searchParams.get("playerId");
    const difficulty = searchParams.get("difficulty");

    // --- ОТРИМАННЯ ВСІХ РЕКОРДІВ ГРАВЦЯ ---
    // Запит: /api/scores?playerId=...
    if (playerId && !difficulty) {
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

    // --- ОТРИМАННЯ ВСІХ РЕКОРДІВ ДЛЯ ЛІДЕРБОРДУ ---
    if (difficulty) {
      if (!playerId) {
        const topScores = await db.getTopScores(difficulty);
        return NextResponse.json({ leaderboard: topScores }, { status: 200 });
      }
      // Для одного результату (є playerId)
      else {
        const bestScoreValue = await db.getBestScore({ playerId, difficulty });
        return NextResponse.json(
          { bestScore: bestScoreValue || 0 },
          { status: 200 }
        );
      }
    }

    // Якщо параметри не відповідають жодному з випадків
    return NextResponse.json(
      {
        error:
          "Invalid or missing parameters. Use (playerId), (difficulty), or (playerId & difficulty).",
      },
      { status: 400 }
    );
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
