/*
  Warnings:

  - You are about to drop the column `passwordHash` on the `ShareLink` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ShareLink" DROP COLUMN "passwordHash",
ADD COLUMN     "hashedPassword" TEXT;
