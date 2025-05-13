-- CreateEnum
CREATE TYPE "Environment" AS ENUM ('PROD', 'DEV', 'TEST');

-- CreateTable
CREATE TABLE "System" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "environment" "Environment" NOT NULL,

    CONSTRAINT "System_pkey" PRIMARY KEY ("id")
);
