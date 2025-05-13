-- DropForeignKey
ALTER TABLE "Valts" DROP CONSTRAINT "Valts_assigneeId_fkey";

-- AlterTable
ALTER TABLE "Valts" ALTER COLUMN "assigneeId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Valts" ADD CONSTRAINT "Valts_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
