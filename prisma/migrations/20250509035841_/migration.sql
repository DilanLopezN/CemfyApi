/*
  Warnings:

  - You are about to drop the `_AssigneeToAssigneeSlugs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AssigneeToAssigneeSlugs" DROP CONSTRAINT "_AssigneeToAssigneeSlugs_A_fkey";

-- DropForeignKey
ALTER TABLE "_AssigneeToAssigneeSlugs" DROP CONSTRAINT "_AssigneeToAssigneeSlugs_B_fkey";

-- AlterTable
ALTER TABLE "Assignee" ADD COLUMN     "assigneeSlugsId" INTEGER;

-- DropTable
DROP TABLE "_AssigneeToAssigneeSlugs";

-- AddForeignKey
ALTER TABLE "Assignee" ADD CONSTRAINT "Assignee_assigneeSlugsId_fkey" FOREIGN KEY ("assigneeSlugsId") REFERENCES "AssigneeSlugs"("id") ON DELETE SET NULL ON UPDATE CASCADE;
