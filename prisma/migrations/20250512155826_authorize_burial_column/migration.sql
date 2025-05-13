-- AlterTable
ALTER TABLE "Deceased" ADD COLUMN     "authorizeBurial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "authorizeBurialContractId" TEXT;
