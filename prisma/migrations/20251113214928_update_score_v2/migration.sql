/*
  Warnings:

  - You are about to drop the column `createdAt` on the `scores` table. All the data in the column will be lost.
  - You are about to drop the column `score` on the `scores` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,difficulty]` on the table `scores` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bestScore` to the `scores` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "scores" DROP COLUMN "createdAt",
DROP COLUMN "score",
ADD COLUMN     "bestScore" INTEGER NOT NULL,
ADD COLUMN     "lastPlayed" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "scores_userId_difficulty_key" ON "scores"("userId", "difficulty");
