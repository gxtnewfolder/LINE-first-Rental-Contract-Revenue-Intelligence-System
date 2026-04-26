-- AlterTable
ALTER TABLE "tenants" ADD COLUMN "inviteToken" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "tenants_inviteToken_key" ON "tenants"("inviteToken");
