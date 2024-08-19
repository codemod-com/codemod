/*
  Warnings:

  - You are about to drop the column `after` on the `CodeDiff` table. All the data in the column will be lost.
  - You are about to drop the column `before` on the `CodeDiff` table. All the data in the column will be lost.
  - Added the required column `diffs` to the `CodeDiff` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodeDiff" DROP COLUMN "after",
DROP COLUMN "before",
ADD COLUMN     "diffs" TEXT NOT NULL;
