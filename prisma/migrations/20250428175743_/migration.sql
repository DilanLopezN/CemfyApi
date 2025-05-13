/*
  Warnings:

  - A unique constraint covering the columns `[sealId]` on the table `Drawers` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Drawers" ADD COLUMN     "sealId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Drawers_sealId_key" ON "Drawers"("sealId");
