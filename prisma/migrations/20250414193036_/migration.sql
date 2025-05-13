-- DropForeignKey
ALTER TABLE "ValtOwners" DROP CONSTRAINT "ValtOwners_paymentHistoryId_fkey";

-- AlterTable
ALTER TABLE "ValtOwners" ALTER COLUMN "paymentHistoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ValtOwners" ADD CONSTRAINT "ValtOwners_paymentHistoryId_fkey" FOREIGN KEY ("paymentHistoryId") REFERENCES "PaymentHistory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
