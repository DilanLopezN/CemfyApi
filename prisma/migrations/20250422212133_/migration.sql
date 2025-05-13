/*
  Warnings:

  - You are about to drop the column `innerSeal` on the `Deceased` table. All the data in the column will be lost.
  - You are about to drop the column `outerSeal` on the `Deceased` table. All the data in the column will be lost.
  - You are about to drop the column `steelSeal` on the `Deceased` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Deceased" DROP COLUMN "innerSeal",
DROP COLUMN "outerSeal",
DROP COLUMN "steelSeal";
