/** @type { import("drizzle-kit").Config } */
export default {
  schema: "./src/lib/schema.js", // Шлях до вашої схеми
  out: "./drizzle", // Папка для згенерованих міграцій
  driver: "pg",
  dbCredentials: {
    connectionString: process.env.DATABASE_URL, // Drizzle Kit буде використовувати DATABASE_URL з .env.local
  },
};
