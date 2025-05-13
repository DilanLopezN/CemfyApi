/*
  Warnings:

  - A unique constraint covering the columns `[assigneeId]` on the table `ValtOwners` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ValtOwners_assigneeId_key" ON "ValtOwners"("assigneeId");
