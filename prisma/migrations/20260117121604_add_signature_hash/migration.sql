/*
  Warnings:

  - Added the required column `signatureHash` to the `contract_signatures` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "contract_signatures" ADD COLUMN     "signatureHash" TEXT NOT NULL;
