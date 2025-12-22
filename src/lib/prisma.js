import { PrismaClient } from "../../prisma/generated/client/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrisma = () =>
  new PrismaClient({
    accelerateUrl: process.env.DATABASE_URL,
  }).$extends(withAccelerate());

const globalForPrisma = globalThis;

const prisma = globalForPrisma.prismaGlobal || createPrisma();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}

export default prisma;
