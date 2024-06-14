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
  - You are about to drop the column `shortDescription` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to drop the column `totalTimeSaved` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to drop the `TokenMetadata` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TokenRevocation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `description` to the `CodemodVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "amountOfUses",
DROP COLUMN "applicability",
DROP COLUMN "arguments",
DROP COLUMN "engine",
DROP COLUMN "openedPrs",
DROP COLUMN "shortDescription",
DROP COLUMN "tags",
DROP COLUMN "totalTimeSaved",
ADD COLUMN     "category" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "frameworks" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "amountOfUses",
DROP COLUMN "openedPrs",
DROP COLUMN "shortDescription",
DROP COLUMN "totalTimeSaved",
ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "UserLoginIntent" ALTER COLUMN "token" SET DATA TYPE TEXT;

-- DropTable
DROP TABLE "TokenMetadata";

-- DropTable
DROP TABLE "TokenRevocation";

-- CreateIndex
CREATE INDEX "Codemod_author_idx" ON "Codemod"("author");

-- CreateIndex
CREATE INDEX "Codemod_name_idx" ON "Codemod"("name");

-- CreateIndex
CREATE INDEX "Codemod_featured_idx" ON "Codemod"("featured");

-- CreateIndex
CREATE INDEX "Codemod_verified_idx" ON "Codemod"("verified");

-- CreateIndex
CREATE INDEX "CodemodVersion_codemodId_idx" ON "CodemodVersion"("codemodId");

-- CreateIndex
CREATE INDEX "CodemodVersion_createdAt_idx" ON "CodemodVersion"("createdAt");

-- CreateIndex
CREATE INDEX "Tag_title_idx" ON "Tag"("title");

-- CreateIndex
CREATE INDEX "Tag_aliases_idx" ON "Tag"("aliases");
