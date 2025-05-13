/*
  Warnings:

  - Added the required column `prohibited` to the `LocalPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `restValue` to the `LocalPayment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amoutPayed` to the `PaymentsAttachment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
ALTER TYPE "MethodType" ADD VALUE 'LOCAL';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "PaymentStatus" ADD VALUE 'ENTRADA_LOCAL';
ALTER TYPE "PaymentStatus" ADD VALUE 'ENTRADA_GATEWAY';

-- AlterTable
ALTER TABLE "LocalPayment" ADD COLUMN     "prohibited" BOOLEAN NOT NULL,
ADD COLUMN     "restValue" DOUBLE PRECISION NOT NULL;

-- AlterTable
ALTER TABLE "PaymentsAttachment" ADD COLUMN     "amoutPayed" DOUBLE PRECISION NOT NULL;
