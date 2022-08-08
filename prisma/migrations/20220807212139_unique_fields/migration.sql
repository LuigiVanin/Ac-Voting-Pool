/*
  Warnings:

  - A unique constraint covering the columns `[poolId,userId]` on the table `participants` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ownerId,poolId]` on the table `votes` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "participants_poolId_userId_key" ON "participants"("poolId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "votes_ownerId_poolId_key" ON "votes"("ownerId", "poolId");
