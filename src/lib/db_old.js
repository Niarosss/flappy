import { drizzle } from "drizzle-orm/vercel-postgres";
import { sql } from "@vercel/postgres";
import { players, scores } from "./schema";
import { eq, desc, max, and } from "drizzle-orm";

// --- LocalStorage для dev ---
class LocalStorageDB {
  constructor() {
    this.players = [];
    this.scores = [];
    this.playerIdCounter = 1;
    this.scoreIdCounter = 1;

    // Завантажуємо дані з localStorage при ініціалізації
    if (typeof window !== "undefined") {
      this.loadFromLocalStorage();
    }
  }

  loadFromLocalStorage() {
    if (typeof window !== "undefined") {
      try {
        const savedPlayers = localStorage.getItem("flappy-bird-players");
        const savedScores = localStorage.getItem("flappy-bird-scores");
        const savedPlayerCounter = localStorage.getItem(
          "flappy-bird-player-counter"
        );
        const savedScoreCounter = localStorage.getItem(
          "flappy-bird-score-counter"
        );

        this.players = savedPlayers ? JSON.parse(savedPlayers) : [];
        this.scores = savedScores ? JSON.parse(savedScores) : [];
        this.playerIdCounter = savedPlayerCounter
          ? parseInt(savedPlayerCounter)
          : 1;
        this.scoreIdCounter = savedScoreCounter
          ? parseInt(savedScoreCounter)
          : 1;
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        this.players = [];
        this.scores = [];
        this.playerIdCounter = 1;
        this.scoreIdCounter = 1;
      }
    }
  }

  saveToLocalStorage() {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(
          "flappy-bird-players",
          JSON.stringify(this.players)
        );
        localStorage.setItem("flappy-bird-scores", JSON.stringify(this.scores));
        localStorage.setItem(
          "flappy-bird-player-counter",
          this.playerIdCounter.toString()
        );
        localStorage.setItem(
          "flappy-bird-score-counter",
          this.scoreIdCounter.toString()
        );
      } catch (error) {
        console.error("Error saving to localStorage:", error);
      }
    }
  }

  createPlayer(nickname) {
    nickname = nickname.trim();
    const exists = this.players.find(
      (p) => p.nickname.toLowerCase() === nickname.toLowerCase()
    );
    if (exists) throw new Error("Nickname already exists");

    const player = {
      id: this.playerIdCounter++,
      nickname,
      createdAt: new Date().toISOString(),
    };
    this.players.push(player);
    this.saveToLocalStorage();
    return player;
  }

  getPlayerById(id) {
    return this.players.find((p) => p.id === parseInt(id)) || null;
  }

  getPlayerByNickname(nickname) {
    return this.players.find((p) => p.nickname === nickname) || null;
  }

  createScore(playerId, scoreValue, difficulty = "medium") {
    const player = this.getPlayerById(playerId);
    if (!player) throw new Error("Player not found");

    const numericScore = Number(scoreValue) || 0;

    // Шукаємо існуючий результат для цієї складності
    let existingIndex = -1;
    if (difficulty) {
      existingIndex = this.scores.findIndex(
        (s) => s.playerId === parseInt(playerId) && s.difficulty === difficulty
      );
    }

    let scoreRecord;
    if (existingIndex !== -1) {
      // Оновлюємо існуючий результат, якщо новий кращий
      if (numericScore > this.scores[existingIndex].score) {
        this.scores[existingIndex].score = numericScore;
        this.scores[existingIndex].updatedAt = new Date().toISOString();
      }
      scoreRecord = this.scores[existingIndex];
    } else {
      // Створюємо новий результат
      scoreRecord = {
        id: this.scoreIdCounter++,
        playerId: parseInt(playerId),
        score: numericScore,
        difficulty: difficulty || "medium",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.scores.push(scoreRecord);
    }

    this.saveToLocalStorage();
    return scoreRecord;
  }

  getPlayerBestScores(playerId, difficulty = null) {
    let playerScores = this.scores.filter(
      (s) => s.playerId === parseInt(playerId)
    );

    if (difficulty) {
      playerScores = playerScores.filter((s) => s.difficulty === difficulty);
    }

    const bestScores = {};

    // Для кожної складності знаходимо найкращий результат
    const difficulties = difficulty ? [difficulty] : ["easy", "medium", "hard"];
    difficulties.forEach((diff) => {
      const scoresForDiff = playerScores.filter((s) => s.difficulty === diff);
      if (scoresForDiff.length > 0) {
        bestScores[diff] = Math.max(...scoresForDiff.map((s) => s.score));
      } else {
        bestScores[diff] = 0;
      }
    });

    return bestScores;
  }

  getLeaderboard(difficulty = null) {
    let filteredScores = [...this.scores];

    if (difficulty) {
      filteredScores = filteredScores.filter(
        (s) => s.difficulty === difficulty
      );
    }

    // Знаходимо найкращий результат для кожного гравця
    const bestScoresMap = new Map();
    filteredScores.forEach((score) => {
      const currentBest = bestScoresMap.get(score.playerId);
      if (!currentBest || score.score > currentBest.score) {
        bestScoresMap.set(score.playerId, {
          ...score,
          player: this.players.find((p) => p.id === score.playerId),
        });
      }
    });

    // Сортуємо за результатом
    return Array.from(bestScoresMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }

  clear() {
    this.players = [];
    this.scores = [];
    this.playerIdCounter = 1;
    this.scoreIdCounter = 1;
    this.saveToLocalStorage();
    console.log("🗑️ LocalStorageDB cleared");
  }

  getDebugInfo() {
    return {
      players: this.players,
      scores: this.scores,
      playerIdCounter: this.playerIdCounter,
      scoreIdCounter: this.scoreIdCounter,
      playersCount: this.players.length,
      scoresCount: this.scores.length,
      isClient: typeof window !== "undefined",
    };
  }
}

// --- Основна Database ---
class Database {
  constructor() {
    this.isLocal = !process.env.POSTGRES_URL;
    if (this.isLocal) {
      // Глобальний singleton для HMR
      if (!global._localDB) global._localDB = new LocalStorageDB();
      this.localDB = global._localDB;
      console.log("Database running in LocalStorage mode");
    } else {
      this.db = drizzle(sql);
      console.log("Database running in PostgreSQL mode");
    }
  }

  async createPlayer(nickname) {
    if (this.isLocal) return this.localDB.createPlayer(nickname);

    const [player] = await this.db
      .insert(players)
      .values({ nickname })
      .returning();
    return player;
  }

  async getPlayerById(id) {
    if (this.isLocal) return this.localDB.getPlayerById(id);

    const [player] = await this.db
      .select()
      .from(players)
      .where(eq(players.id, parseInt(id)))
      .limit(1);
    return player || null;
  }

  async getPlayerByNickname(nickname) {
    if (this.isLocal) return this.localDB.getPlayerByNickname(nickname);

    const [player] = await this.db
      .select()
      .from(players)
      .where(eq(players.nickname, nickname))
      .limit(1);
    return player || null;
  }

  async createScore(playerId, scoreValue, difficulty = "medium") {
    if (this.isLocal)
      return this.localDB.createScore(playerId, scoreValue, difficulty);

    const player = await this.getPlayerById(playerId);
    if (!player) throw new Error("Player not found");

    // Спочатку шукаємо існуючий результат
    const [existingScore] = await this.db
      .select()
      .from(scores)
      .where(
        and(
          eq(scores.playerId, parseInt(playerId)),
          eq(scores.difficulty, difficulty)
        )
      )
      .limit(1);

    let score;
    if (existingScore) {
      // Оновлюємо, якщо новий результат кращий
      if (parseInt(scoreValue) > existingScore.score) {
        [score] = await this.db
          .update(scores)
          .set({
            score: parseInt(scoreValue),
            updatedAt: new Date(),
          })
          .where(eq(scores.id, existingScore.id))
          .returning();
      } else {
        score = existingScore;
      }
    } else {
      // Створюємо новий результат
      [score] = await this.db
        .insert(scores)
        .values({
          playerId: parseInt(playerId),
          score: parseInt(scoreValue),
          difficulty,
        })
        .returning();
    }

    return score;
  }

  async getPlayerBestScores(playerId, difficulty = null) {
    if (this.isLocal) {
      return this.localDB.getPlayerBestScores(playerId, difficulty);
    }

    let query;
    if (difficulty) {
      // Для конкретної складності
      query = this.db
        .select({ difficulty: scores.difficulty, bestScore: max(scores.score) })
        .from(scores)
        .where(
          and(
            eq(scores.playerId, parseInt(playerId)),
            eq(scores.difficulty, difficulty)
          )
        )
        .groupBy(scores.difficulty);
    } else {
      // Для всіх складностей
      query = this.db
        .select({ difficulty: scores.difficulty, bestScore: max(scores.score) })
        .from(scores)
        .where(eq(scores.playerId, parseInt(playerId)))
        .groupBy(scores.difficulty);
    }

    const result = await query;
    const formatted = { easy: 0, medium: 0, hard: 0 };
    result.forEach((r) => (formatted[r.difficulty] = r.bestScore));

    return formatted;
  }

  async getLeaderboard(difficulty = null) {
    if (this.isLocal) return this.localDB.getLeaderboard(difficulty);

    let subquery;
    if (difficulty) {
      subquery = this.db
        .select({
          playerId: scores.playerId,
          maxScore: max(scores.score).as("maxScore"),
        })
        .from(scores)
        .where(eq(scores.difficulty, difficulty))
        .groupBy(scores.playerId);
    } else {
      subquery = this.db
        .select({
          playerId: scores.playerId,
          maxScore: max(scores.score).as("maxScore"),
        })
        .from(scores)
        .groupBy(scores.playerId);
    }

    const leaderboard = await this.db
      .select({
        player: {
          id: players.id,
          nickname: players.nickname,
        },
        score: subquery.maxScore,
      })
      .from(subquery)
      .innerJoin(players, eq(players.id, subquery.playerId))
      .orderBy(desc(subquery.maxScore))
      .limit(10);

    return leaderboard;
  }
}

// --- Експорт singleton для всіх API ---
if (!global._dbInstance) global._dbInstance = new Database();
export const db = global._dbInstance;
