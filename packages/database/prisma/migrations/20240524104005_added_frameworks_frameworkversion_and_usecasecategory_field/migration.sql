-- AlterTable
ALTER TABLE "Codemod" ADD COLUMN     "frameworkVersion" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "frameworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "useCaseCategory" VARCHAR(255) NOT NULL DEFAULT '';
