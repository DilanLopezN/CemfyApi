-- CreateTable
CREATE TABLE "AssigneeSlugs" (
    "id" SERIAL NOT NULL,
    "slugName" TEXT NOT NULL,
    "slugHex" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigneeId" INTEGER,

    CONSTRAINT "AssigneeSlugs_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AssigneeSlugs" ADD CONSTRAINT "AssigneeSlugs_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "Assignee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
