/*
  Warnings:

  - You are about to drop the column `amountOfUses` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `applicability` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `arguments` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `engine` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `openedPrs` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `totalTimeSaved` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `amountOfUses` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to drop the column `openedPrs` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to drop the column `totalTimeSaved` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to drop the `TokenMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenRevocation` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "amountOfUses",
DROP COLUMN "applicability",
DROP COLUMN "arguments",
DROP COLUMN "engine",
DROP COLUMN "openedPrs",
DROP COLUMN "shortDescription",
DROP COLUMN "tags",
DROP COLUMN "totalTimeSaved";

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "amountOfUses",
DROP COLUMN "openedPrs",
DROP COLUMN "totalTimeSaved";

-- DropTable
DROP TABLE "TokenMetadata";

-- DropTable
DROP TABLE "TokenRevocation";
