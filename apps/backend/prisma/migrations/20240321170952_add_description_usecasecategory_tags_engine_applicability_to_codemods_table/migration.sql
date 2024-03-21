-- AlterTable
ALTER TABLE "Codemod" ADD COLUMN     "applicability" JSONB,
ADD COLUMN     "engine" VARCHAR(255),
ADD COLUMN     "shortDescription" TEXT,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "useCaseCategory" VARCHAR(255);
