import { PrismaClient } from "@/generated/prisma/client";
const globalForPrisma = global;

const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Клас, який обгортає логіку роботи з БД
class Database {
  /**
   * Зберігає або оновлює результат гри. Оновлює лише, якщо новий результат > bestScore.
   */
  async saveOrUpdateScore({ playerId, score, difficulty }) {
    try {
      const numericScore = Number(score);

      // ВИПРАВЛЕНО: 'prisma.score' замість 'prisma.scores'
      const existingRecord = await prisma.score.findUnique({
        where: {
          // ВИПРАВЛЕНО: Prisma генерує індекс як 'userId_difficulty'
          userId_difficulty: {
            userId: playerId, // Поле в моделі називається 'userId'
            difficulty,
          },
        },
        select: {
          bestScore: true,
        },
      });

      if (existingRecord && numericScore > existingRecord.bestScore) {
        // Оновлюємо, якщо новий результат кращий
        // ВИПРАВЛЕНО: 'prisma.score'
        return await prisma.score.update({
          where: {
            userId_difficulty: {
              userId: playerId,
              difficulty,
            },
          },
          data: {
            bestScore: numericScore, // Поле в моделі 'bestScore'
            lastPlayed: new Date(), // Оновлюємо час гри
          },
        });
      } else if (!existingRecord) {
        // Створюємо, якщо запис не існує
        // ВИПРАВЛЕНО: 'prisma.score'
        return await prisma.score.create({
          data: {
            userId: playerId,
            difficulty,
            bestScore: numericScore, // Поле в моделі 'bestScore'
            lastPlayed: new Date(),
          },
        });
      } else {
        // Якщо результат не кращий, оновлюємо лише час останньої гри
        // ВИПРАВЛЕНО: 'prisma.score'
        return await prisma.score.update({
          where: {
            userId_difficulty: {
              userId: playerId,
              difficulty,
            },
          },
          data: {
            lastPlayed: new Date(),
          },
        });
      }
    } catch (error) {
      console.error("Помилка при збереженні/оновленні результату:", error);
      throw new Error(`Score save/update failed: ${error.message}`);
    }
  }

  /**
   * Отримує найкращий результат для конкретного гравця та рівня складності.
   */
  async getBestScore({ playerId, difficulty }) {
    try {
      // ВИПРАВЛЕНО: 'prisma.score'
      const result = await prisma.score.findUnique({
        where: {
          userId_difficulty: {
            userId: playerId,
            difficulty,
          },
        },
        select: {
          bestScore: true,
        },
      });
      return result ? result.bestScore : null;
    } catch (error) {
      console.error("Помилка при отриманні найкращого результату:", error);
      throw new Error(`Score retrieval failed: ${error.message}`);
    }
  }

  /**
   * Отримує топ-10 результатів для заданої складності.
   */
  async getTopScores(difficulty) {
    try {
      const topScores = await prisma.score.findMany({
        where: { difficulty },
        orderBy: { bestScore: "desc" },
        take: 10,
        include: {
          user: {
            select: {
              name: true,
              image: true,
            },
          },
        },
      });

      return topScores.map((s) => ({
        id: s.id,
        player: {
          name: s.user.name,
          image: s.user.image ?? null,
        },
        score: s.bestScore,
        difficulty: s.difficulty,
        createdAt: s.lastPlayed,
      }));
    } catch (error) {
      console.error("Помилка при отриманні топ-результатів:", error);
      throw new Error(`Leaderboard retrieval failed: ${error.message}`);
    }
  }
}

const db = new Database();
export default db;
