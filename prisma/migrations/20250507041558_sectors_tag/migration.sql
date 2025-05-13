-- DropForeignKey
ALTER TABLE "Valts" DROP CONSTRAINT "Valts_sectorsId_fkey";

-- AlterTable
ALTER TABLE "Squares" ADD COLUMN     "sectorsId" TEXT;

-- CreateTable
CREATE TABLE "SectorTags" (
    "id" SERIAL NOT NULL,
    "tagName" TEXT NOT NULL,
    "tagHex" TEXT NOT NULL,
    "sectorsId" TEXT,

    CONSTRAINT "SectorTags_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SectorTags" ADD CONSTRAINT "SectorTags_sectorsId_fkey" FOREIGN KEY ("sectorsId") REFERENCES "Sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Squares" ADD CONSTRAINT "Squares_sectorsId_fkey" FOREIGN KEY ("sectorsId") REFERENCES "Sectors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
