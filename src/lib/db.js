import { drizzle } from "drizzle-orm/vercel-postgres"; // Або 'drizzle-orm/node-postgres' якщо не Vercel Postgres
import { sql } from "@vercel/postgres"; // Або 'pg' якщо не Vercel Postgres
import * as schema from "./schema"; // Імпортуємо вашу схему

export const db = drizzle(sql, { schema });
