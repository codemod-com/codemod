-- AlterTable
ALTER TABLE "Codemod" ADD COLUMN     "arguments" JSONB;

-- AlterTable
ALTER TABLE "CodemodVersion" ADD COLUMN     "arguments" JSONB;
