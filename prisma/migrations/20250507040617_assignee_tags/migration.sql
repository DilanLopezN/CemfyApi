-- CreateEnum
CREATE TYPE "AssigneTags" AS ENUM ('OLD', 'NEW', 'OFF');

-- AlterTable
ALTER TABLE "Assignee" ADD COLUMN     "tag" "AssigneTags" NOT NULL DEFAULT 'NEW';

-- AlterTable
ALTER TABLE "Deceased" ALTER COLUMN "identificationDoc" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Responsibles" ALTER COLUMN "identityNumber" DROP NOT NULL;
