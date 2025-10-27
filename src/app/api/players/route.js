import { db } from "@/lib/db_old";

export async function POST(req) {
  try {
    const { nickname } = await req.json();
    if (!nickname || !nickname.trim()) {
      return new Response(JSON.stringify({ error: "Nickname is required" }), {
        status: 400,
      });
    }

    // Створюємо гравця
    const player = await db.createPlayer(nickname.trim());

    return new Response(JSON.stringify(player), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error creating player:", err);

    // Обробка конфлікту nickname
    if (
      err.message.includes("already exists") ||
      err.message.includes("Nickname already")
    ) {
      return new Response(
        JSON.stringify({ error: "Nickname already exists" }),
        { status: 409 }
      );
    }

    return new Response(
      JSON.stringify({ error: err.message || "Failed to create player" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

export async function GET(req) {
  try {
    const url = new URL(req.url);
    const nickname = url.searchParams.get("nickname");
    const id = url.searchParams.get("id");

    console.log("🔍 Players API called with:", { nickname, id });

    let player = null;

    if (id) {
      player = await db.getPlayerById(parseInt(id));
      console.log("🔍 Player by ID result:", player);
    } else if (nickname) {
      player = await db.getPlayerByNickname(nickname);
      console.log("🔍 Player by nickname result:", player);
    }

    if (!player) {
      console.log("❌ Player not found");
      return new Response(JSON.stringify({ error: "Player not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("✅ Player found:", player);
    return new Response(JSON.stringify(player), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("❌ Error fetching player:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
