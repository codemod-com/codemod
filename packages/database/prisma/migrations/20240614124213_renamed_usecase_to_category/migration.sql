/*
  Warnings:

  - You are about to drop the column `useCase` on the `Codemod` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Codemod" DROP COLUMN "useCase",
ADD COLUMN     "category" VARCHAR(255) NOT NULL DEFAULT '';
