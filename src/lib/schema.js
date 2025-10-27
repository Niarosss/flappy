import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  nickname: varchar("nickname", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const scores = pgTable(
  "scores",
  {
    id: serial("id").primaryKey(),
    score: integer("score").notNull(),
    playerId: integer("player_id").references(() => players.id),
    difficulty: varchar("difficulty", { length: 10 })
      .notNull()
      .default("medium"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      // 👇 Додаємо унікальний індекс для пари (гравець + складність)
      playerDifficultyUnique: uniqueIndex("player_difficulty_unique").on(
        table.playerId,
        table.difficulty
      ),
    };
  }
);
