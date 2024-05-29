/*
  Warnings:

  - You are about to drop the column `shortDescription` on the `CodemodVersion` table. All the data in the column will be lost.
  - Added the required column `description` to the `Codemod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `CodemodVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Codemod" ADD COLUMN     "description" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "shortDescription",
ADD COLUMN     "description" TEXT NOT NULL;

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
