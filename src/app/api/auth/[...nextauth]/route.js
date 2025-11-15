// Імпортуємо обробники (handlers) з нашого файлу auth.js
import { handlers } from "@/auth";

// Експортуємо GET та POST для обробки всіх запитів
export const { GET, POST } = handlers;

export const dynamic = "force-dynamic";
