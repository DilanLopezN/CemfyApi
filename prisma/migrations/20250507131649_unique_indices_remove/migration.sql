-- DropIndex
DROP INDEX "Deceased_identificationDoc_key";

-- DropIndex
DROP INDEX "Deceased_registration_key";

-- DropIndex
DROP INDEX "Responsibles_identityNumber_key";

-- AlterTable
ALTER TABLE "Deceased" ALTER COLUMN "registration" DROP NOT NULL;
