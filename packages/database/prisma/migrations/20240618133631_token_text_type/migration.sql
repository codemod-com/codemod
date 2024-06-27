/*
  Warnings:

  - You are about to drop the `TokenMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenRevocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "UserLoginIntent" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "TokenMetadata";

-- DropTable
DROP TABLE "TokenRevocation";
