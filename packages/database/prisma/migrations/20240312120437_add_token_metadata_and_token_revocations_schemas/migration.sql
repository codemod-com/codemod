/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `Codemod` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Codemod" ALTER COLUMN "verified" SET DEFAULT false,
ALTER COLUMN "from" DROP NOT NULL,
ALTER COLUMN "to" DROP NOT NULL;

-- AlterTable
ALTER TABLE "CodemodVersion" ALTER COLUMN "codemodStudioExampleLink" DROP NOT NULL,
ALTER COLUMN "testProjectCommand" DROP NOT NULL;

-- CreateTable
CREATE TABLE "TokenMetadata" (
    "pathd" VARCHAR(27) NOT NULL,
    "biv" VARCHAR(22) NOT NULL,
    "euid" VARCHAR(64) NOT NULL,
    "ca" BIGINT NOT NULL,
    "ea" BIGINT NOT NULL,
    "c" BIGINT NOT NULL,
    "s" VARCHAR(43) NOT NULL,

    CONSTRAINT "TokenMetadata_pkey" PRIMARY KEY ("pathd")
);

-- CreateTable
CREATE TABLE "TokenRevocation" (
    "pathd" VARCHAR(27) NOT NULL,
    "r" BIGINT NOT NULL,
    "s" VARCHAR(43) NOT NULL,

    CONSTRAINT "TokenRevocation_pkey" PRIMARY KEY ("pathd")
);

-- CreateIndex
CREATE UNIQUE INDEX "Codemod_name_key" ON "Codemod"("name");
