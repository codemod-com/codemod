/*
  Warnings:

  - Added the required column `engine` to the `Codemod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Codemod" ADD COLUMN     "applicability" JSONB,
ADD COLUMN     "engine" VARCHAR(255),
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "useCaseCategory" VARCHAR(255);

UPDATE "Codemod" SET "engine" = 'default_engine' WHERE "engine" IS NULL;

ALTER TABLE "Codemod" ALTER COLUMN "engine" SET NOT NULL;
