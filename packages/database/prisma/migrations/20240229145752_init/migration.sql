-- CreateEnum
CREATE TYPE "Type" AS ENUM ('recipe', 'codemod');

-- CreateTable
CREATE TABLE "Codemod" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "private" BOOLEAN NOT NULL,
    "type" "Type" NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL,
    "author" VARCHAR(255) NOT NULL,
    "engine" VARCHAR(255) NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "command" VARCHAR(255) NOT NULL,
    "vsCodeLink" VARCHAR(255) NOT NULL,
    "codemodStudioExampleLink" VARCHAR(255) NOT NULL,
    "testProjectCommand" VARCHAR(255) NOT NULL,
    "sourceRepo" VARCHAR(255) NOT NULL,
    "amountOfUses" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSaved" INTEGER NOT NULL DEFAULT 0,
    "openedPrs" INTEGER NOT NULL DEFAULT 0,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "readmeLink" VARCHAR(255) NOT NULL,
    "indexTsLink" VARCHAR(255) NOT NULL,
    "framework" VARCHAR(255),
    "frameworkVersion" VARCHAR(255),
    "userStories" VARCHAR(255),
    "requirements" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Codemod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Codemod_slug_key" ON "Codemod"("slug");
