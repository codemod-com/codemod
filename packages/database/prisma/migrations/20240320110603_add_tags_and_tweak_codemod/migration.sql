/*
  Warnings:

  - You are about to drop the column `from` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `to` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `CodemodVersion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "from",
DROP COLUMN "to",
DROP COLUMN "type";

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "requirements",
ADD COLUMN     "applicability" JSONB,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "useCaseCategory" VARCHAR(255),
ALTER COLUMN "sourceRepo" DROP NOT NULL;

-- DropEnum
DROP TYPE "CodemodType";

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "aliases" TEXT[],
    "classification" VARCHAR(255) NOT NULL,
    "displayName" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);
