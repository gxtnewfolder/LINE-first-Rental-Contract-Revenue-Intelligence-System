-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('LITE', 'PRO');

-- AlterTable
ALTER TABLE "buildings" ADD COLUMN     "ownerId" TEXT;

-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "ownerId" TEXT;

-- CreateTable
CREATE TABLE "owners" (
    "id" TEXT NOT NULL,
    "lineUserId" TEXT NOT NULL,
    "displayName" TEXT,
    "pictureUrl" TEXT,
    "plan" "Plan" NOT NULL DEFAULT 'LITE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "owners_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "owners_lineUserId_key" ON "owners"("lineUserId");

-- CreateIndex
CREATE INDEX "owners_lineUserId_idx" ON "owners"("lineUserId");

-- CreateIndex
CREATE INDEX "buildings_ownerId_idx" ON "buildings"("ownerId");

-- CreateIndex
CREATE INDEX "tenants_ownerId_idx" ON "tenants"("ownerId");

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tenants" ADD CONSTRAINT "tenants_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "owners"("id") ON DELETE SET NULL ON UPDATE CASCADE;
