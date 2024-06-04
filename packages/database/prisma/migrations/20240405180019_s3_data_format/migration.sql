/*
  Warnings:

  - You are about to drop the column `bucketLink` on the `CodemodVersion` table. All the data in the column will be lost.
  - Added the required column `s3Bucket` to the `CodemodVersion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `s3UploadKey` to the `CodemodVersion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CodemodVersion" DROP COLUMN "bucketLink",
ADD COLUMN     "s3Bucket" VARCHAR(255) NOT NULL,
ADD COLUMN     "s3UploadKey" VARCHAR(255) NOT NULL;
