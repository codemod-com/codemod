/*
  Warnings:

  - You are about to drop the column `useCaseCategory` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `useCaseCategory` on the `CodemodVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "useCaseCategory";

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "useCaseCategory";
