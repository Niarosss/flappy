import {
  pgTable,
  serial,
  varchar,
  integer,
  timestamp,
  primaryKey, // Додано primaryKey
  text, // Додано text для довших полів
} from "drizzle-orm/pg-core";

// 1. Таблиця Users: Зберігає основну інформацію про користувача
// Це буде ваш "гравець" у грі
export const users = pgTable("users", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(), // ID користувача (зазвичай UUID від NextAuth)
  name: varchar("name", { length: 255 }), // Ім'я користувача з провайдера
  email: varchar("email", { length: 255 }).notNull().unique(), // Email користувача
  emailVerified: timestamp("emailVerified", { mode: "date" }), // Час підтвердження email
  image: varchar("image", { length: 255 }), // URL аватара
  nickname: varchar("nickname", { length: 255 }).unique(), // Ігровий нікнейм (може бути nullable)
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Таблиця Accounts: Зберігає зв'язок між користувачем та OAuth провайдером
export const accounts = pgTable(
  "accounts",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }), // Зв'язок з таблицею users
    type: varchar("type", { length: 255 }).notNull(), // Тип облікового запису (наприклад, "oauth")
    provider: varchar("provider", { length: 255 }).notNull(), // Провайдер (наприклад, "google", "facebook")
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(), // ID облікового запису у провайдера
    refresh_token: text("refresh_token"), // Токен оновлення
    access_token: text("access_token"), // Токен доступу
    expires_at: integer("expires_at"), // Термін дії токена
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: text("id_token"),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    // Композитний первинний ключ для унікальності облікового запису провайдера
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// 3. Таблиця Sessions: Зберігає активні сесії користувачів
export const sessions = pgTable("sessions", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }), // Зв'язок з таблицею users
  expires: timestamp("expires", { mode: "date" }).notNull(), // Термін дії сесії
});

// 4. Таблиця Scores: Оновлено для посилання на users.id
export const scores = pgTable(
  "scores",
  {
    id: serial("id").primaryKey(),
    score: integer("score").notNull(),
    userId: varchar("user_id", { length: 255 }) // Змінено з playerId на userId
      .notNull() // Кожен рахунок повинен бути пов'язаний з користувачем
      .references(() => users.id, { onDelete: "cascade" }), // Зв'язок з таблицею users
    difficulty: varchar("difficulty", { length: 10 })
      .notNull()
      .default("medium"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => {
    return {
      // Унікальний індекс для пари (користувач + складність)
      userDifficultyUnique: primaryKey({
        columns: [table.userId, table.difficulty],
      }),
    };
  }
);
