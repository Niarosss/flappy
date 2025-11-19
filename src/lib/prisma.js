// src/lib/prisma.js

import { PrismaClient } from "@/generated/prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

/**
 * Створює новий єдиний екземпляр Prisma Client з розширенням Accelerate.
 * @returns {PrismaClient}
 */
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

const globalForPrisma = global;
const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
