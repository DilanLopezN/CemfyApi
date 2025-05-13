-- AlterTable
ALTER TABLE "ValtOwners" ADD COLUMN     "entryValue" INTEGER,
ADD COLUMN     "restAmount" INTEGER,
ADD COLUMN     "restInstallments" INTEGER;

-- AlterTable
ALTER TABLE "Valts" ADD COLUMN     "entryPaid" BOOLEAN DEFAULT false;
