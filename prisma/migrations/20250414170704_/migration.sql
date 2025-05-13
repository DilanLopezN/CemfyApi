/*
  Warnings:

  - A unique constraint covering the columns `[valtsId]` on the table `ValtOwners` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[assigneeId]` on the table `Valts` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `assigneeId` to the `Valts` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignee" DROP CONSTRAINT "Assignee_valtsId_fkey";

-- AlterTable
ALTER TABLE "Valts" ADD COLUMN     "assigneeId" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "ValtOwners_valtsId_key" ON "ValtOwners"("valtsId");

-- CreateIndex
CREATE UNIQUE INDEX "Valts_assigneeId_key" ON "Valts"("assigneeId");

-- AddForeignKey
ALTER TABLE "Valts" ADD CONSTRAINT "Valts_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
