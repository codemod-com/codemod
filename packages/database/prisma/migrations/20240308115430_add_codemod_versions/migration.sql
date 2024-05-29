/*
  Warnings:

  - You are about to drop the column `codemodStudioExampleLink` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `command` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `engine` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `framework` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `frameworkVersion` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `indexTsLink` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `lastUpdate` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `readmeLink` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `requirements` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `shortDescription` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `sourceRepo` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `testProjectCommand` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `userStories` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `version` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `vsCodeLink` on the `Codemod` table. All the data in the column will be lost.
  - Added the required column `from` to the `Codemod` table without a default value. This is not possible if the table is not empty.
  - Added the required column `to` to the `Codemod` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `Codemod` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "CodemodType" AS ENUM ('recipe', 'codemod');

-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "codemodStudioExampleLink",
DROP COLUMN "command",
DROP COLUMN "engine",
DROP COLUMN "framework",
DROP COLUMN "frameworkVersion",
DROP COLUMN "indexTsLink",
DROP COLUMN "lastUpdate",
DROP COLUMN "readmeLink",
DROP COLUMN "requirements",
DROP COLUMN "shortDescription",
DROP COLUMN "sourceRepo",
DROP COLUMN "testProjectCommand",
DROP COLUMN "userStories",
DROP COLUMN "version",
DROP COLUMN "vsCodeLink",
ADD COLUMN     "from" VARCHAR(255) NOT NULL,
ADD COLUMN     "to" VARCHAR(255) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "type",
ADD COLUMN     "type" "CodemodType" NOT NULL;

-- DropEnum
DROP TYPE "Type";

-- CreateTable
CREATE TABLE "CodemodVersion" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "engine" VARCHAR(255) NOT NULL,
    "requirements" VARCHAR(255),
    "vsCodeLink" VARCHAR(255) NOT NULL,
    "codemodStudioExampleLink" VARCHAR(255) NOT NULL,
    "testProjectCommand" VARCHAR(255) NOT NULL,
    "sourceRepo" VARCHAR(255) NOT NULL,
    "amountOfUses" INTEGER NOT NULL DEFAULT 0,
    "totalTimeSaved" INTEGER NOT NULL DEFAULT 0,
    "openedPrs" INTEGER NOT NULL DEFAULT 0,
    "bucketLink" VARCHAR(255) NOT NULL,
    "codemodId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodemodVersion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CodemodVersion" ADD CONSTRAINT "CodemodVersion_codemodId_fkey" FOREIGN KEY ("codemodId") REFERENCES "Codemod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
