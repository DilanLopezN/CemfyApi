-- CreateEnum
CREATE TYPE "ServiceHistoryType" AS ENUM ('VISITA_CEMITERIO', 'VISITA_FALECIDO', 'AGENDAMENTO', 'RETORNO_AGENDAMENTO');

-- CreateEnum
CREATE TYPE "ScheduleStatus" AS ENUM ('AGENDADO', 'RETORNO', 'FINALIZADO');

-- DropForeignKey
ALTER TABLE "ValtOwners" DROP CONSTRAINT "ValtOwners_valtsId_fkey";

-- AlterTable
ALTER TABLE "ValtOwners" ADD COLUMN     "drawersId" TEXT,
ALTER COLUMN "valtsId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "AssigneeSchedule" (
    "id" SERIAL NOT NULL,
    "scheduleDate" TIMESTAMP(3) NOT NULL,
    "schedulingReason" TEXT NOT NULL,
    "status" "ScheduleStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneeHistoryId" INTEGER,

    CONSTRAINT "AssigneeSchedule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AssigneeHistory" (
    "id" SERIAL NOT NULL,
    "observations" TEXT,
    "serviceType" "ServiceHistoryType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneeId" INTEGER,

    CONSTRAINT "AssigneeHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssigneeSchedule" ADD CONSTRAINT "AssigneeSchedule_assigneeHistoryId_fkey" FOREIGN KEY ("assigneeHistoryId") REFERENCES "AssigneeHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AssigneeHistory" ADD CONSTRAINT "AssigneeHistory_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_valtsId_fkey" FOREIGN KEY ("valtsId") REFERENCES "Valts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_drawersId_fkey" FOREIGN KEY ("drawersId") REFERENCES "Drawers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
