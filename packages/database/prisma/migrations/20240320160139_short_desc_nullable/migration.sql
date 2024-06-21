/*
  Warnings:

  - A unique constraint covering the columns `[title]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CodemodVersion" ALTER COLUMN "shortDescription" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Tag_title_key" ON "Tag"("title");
