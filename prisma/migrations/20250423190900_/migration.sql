/*
  Warnings:

  - You are about to drop the `relationship` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "IdentityType" AS ENUM ('RG', 'CPF', 'CNH');

-- DropForeignKey
ALTER TABLE "Assignee" DROP CONSTRAINT "Assignee_relationshipId_fkey";

-- DropTable
DROP TABLE "relationship";

-- CreateTable
CREATE TABLE "Responsibles" (
    "id" SERIAL NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "identityNumber" TEXT NOT NULL,
    "identityType" "IdentityType" NOT NULL,
    "ownershipNumber" INTEGER NOT NULL,
    "relationship" "Relationship" NOT NULL,
    "assigneeId" INTEGER,

    CONSTRAINT "Responsibles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Responsibles_identityNumber_key" ON "Responsibles"("identityNumber");

-- AddForeignKey
ALTER TABLE "Responsibles" ADD CONSTRAINT "Responsibles_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
