-- AlterTable
ALTER TABLE "ValtOwners" ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "chargeId" DROP NOT NULL;
