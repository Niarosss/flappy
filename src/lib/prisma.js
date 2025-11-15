// src/lib/prisma.js
// Ініціалізує єдиний екземпляр Prisma Client для запобігання проблемам
// з Hot Module Reloading (HMR) у Next.js.

import { PrismaClient } from "@/generated/prisma/client";
// Імпортуємо розширення для прискорення (використовується Neon)
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * Створює новий екземпляр Prisma Client з розширенням Accelerate.
 * @returns {PrismaClient}
 */
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

// Використовуємо глобальний об'єкт Node.js для збереження екземпляра
// @ts-ignore: Ігноруємо TS-помилки, оскільки це чистий JS-файл
const globalForPrisma = global;

// Якщо глобальний екземпляр вже існує (у режимі розробки), використовуємо його,
// інакше створюємо новий.
const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

// Експортуємо єдиний екземпляр Prisma Client.
export default prisma;

// У режимі розробки зберігаємо екземпляр у глобальному об'єкті
// для захисту від HMR при наступних перезавантаженнях.
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
