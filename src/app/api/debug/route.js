import { db } from "@/lib/db_old";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Not allowed in production" },
        { status: 403 }
      );
    }

    const url = new URL(request.url);
    const action = url.searchParams.get("action");

    console.log("🔧 Debug API called with action:", action);

    if (action === "clear") {
      return await handleClearAction();
    } else if (action === "info") {
      return await handleInfoAction();
    } else {
      // Повертаємо базову інформацію
      return NextResponse.json({
        message: "Debug API is working",
        available_actions: ["info", "clear"],
        environment: process.env.NODE_ENV,
        databaseType: db.isLocal ? "localStorage" : "postgres",
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Debug operation failed", details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    if (process.env.NODE_ENV !== "development") {
      return NextResponse.json(
        { error: "Not allowed in production" },
        { status: 403 }
      );
    }

    const { action } = await request.json();
    console.log("🔧 Debug POST called with action:", action);

    if (action === "clear") {
      return await handleClearAction();
    } else {
      return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Debug POST error:", error);
    return NextResponse.json(
      { error: "Debug operation failed", details: error.message },
      { status: 500 }
    );
  }
}

async function handleClearAction() {
  try {
    console.log("🧹 Starting clear operation...");

    let clearResult;

    if (db.isLocal) {
      console.log("🗃️ Using localStorage database");

      // Очищаємо через метод бази даних
      if (db.localDB) {
        // Спробуємо викликати метод clear, якщо він існує
        if (typeof db.localDB.clear === "function") {
          db.localDB.clear();
          console.log("✅ Cleared via localDB.clear()");
          clearResult = {
            type: "localStorage",
            message: "Local storage cleared successfully",
            method: "localDB.clear()",
          };
        }
        // Спробуємо скинути дані вручну
        else if (db.localDB.players && db.localDB.scores) {
          db.localDB.players = [];
          db.localDB.scores = [];
          db.localDB.playerIdCounter = 1;
          db.localDB.scoreIdCounter = 1;

          // Якщо є метод збереження, викличемо його
          if (typeof db.localDB.saveToLocalStorage === "function") {
            db.localDB.saveToLocalStorage();
          }

          console.log("✅ Cleared by resetting arrays");
          clearResult = {
            type: "localStorage",
            message: "Local storage cleared by resetting arrays",
            method: "manualReset",
          };
        } else {
          throw new Error("Cannot clear - localDB structure not recognized");
        }
      } else {
        throw new Error("localDB not available");
      }
    } else {
      // Для PostgreSQL
      clearResult = {
        type: "postgres",
        message: "PostgreSQL clear not implemented",
        note: "Add TRUNCATE statements for players and scores tables",
      };
    }

    console.log("✅ Clear operation completed");

    return NextResponse.json({
      action: "clear",
      success: true,
      environment: process.env.NODE_ENV,
      databaseType: db.isLocal ? "localStorage" : "postgres",
      clearResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Clear operation failed:", error);
    return NextResponse.json(
      {
        action: "clear",
        success: false,
        error: error.message,
        environment: process.env.NODE_ENV,
        databaseType: db.isLocal ? "localStorage" : "postgres",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

async function handleInfoAction() {
  try {
    console.log("📊 Getting debug info...");

    let debugInfo;

    if (db.isLocal) {
      console.log("🗃️ Using localStorage database");

      if (db.localDB) {
        // Отримуємо інформацію через метод бази даних
        if (typeof db.localDB.getDebugInfo === "function") {
          debugInfo = db.localDB.getDebugInfo();
        } else {
          // Альтернативний спосіб
          debugInfo = {
            players: db.localDB.players || [],
            scores: db.localDB.scores || [],
            playerIdCounter: db.localDB.playerIdCounter || 1,
            scoreIdCounter: db.localDB.scoreIdCounter || 1,
            source: "localDB_direct",
          };
        }
      } else {
        debugInfo = {
          error: "localDB not available",
          source: "error",
        };
      }
    } else {
      debugInfo = {
        type: "postgres",
        message: "PostgreSQL debug info - implement table statistics here",
        note: "Add queries to get row counts from players and scores tables",
      };
    }

    console.log("📊 Debug info retrieved:", debugInfo);

    return NextResponse.json({
      action: "info",
      environment: process.env.NODE_ENV,
      databaseType: db.isLocal ? "localStorage" : "postgres",
      debugInfo,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error getting debug info:", error);
    return NextResponse.json(
      {
        action: "info",
        success: false,
        error: error.message,
        environment: process.env.NODE_ENV,
        databaseType: db.isLocal ? "localStorage" : "postgres",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
