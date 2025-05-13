/*
  Warnings:

  - You are about to drop the column `assigneeId` on the `AssigneeSlugs` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "AssigneeSlugs" DROP CONSTRAINT "AssigneeSlugs_assigneeId_fkey";

-- AlterTable
ALTER TABLE "AssigneeSlugs" DROP COLUMN "assigneeId";

-- CreateTable
CREATE TABLE "_AssigneeToAssigneeSlugs" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_AssigneeToAssigneeSlugs_AB_unique" ON "_AssigneeToAssigneeSlugs"("A", "B");

-- CreateIndex
CREATE INDEX "_AssigneeToAssigneeSlugs_B_index" ON "_AssigneeToAssigneeSlugs"("B");

-- AddForeignKey
ALTER TABLE "_AssigneeToAssigneeSlugs" ADD CONSTRAINT "_AssigneeToAssigneeSlugs_A_fkey" FOREIGN KEY ("A") REFERENCES "Assignee"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AssigneeToAssigneeSlugs" ADD CONSTRAINT "_AssigneeToAssigneeSlugs_B_fkey" FOREIGN KEY ("B") REFERENCES "AssigneeSlugs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
