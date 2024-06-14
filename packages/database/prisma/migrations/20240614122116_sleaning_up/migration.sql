/*
  Warnings:

  - You are about to drop the column `category` on the `Codemod` table. All the data in the column will be lost.
  - You are about to drop the column `tags` on the `CodemodVersion` table. All the data in the column will be lost.
  - You are about to alter the column `token` on the `UserLoginIntent` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - Added the required column `description` to the `Codemod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "category",
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "useCase" VARCHAR(255) NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "tags";

-- AlterTable
ALTER TABLE "UserLoginIntent" ALTER COLUMN "token" SET DATA TYPE VARCHAR(255);
