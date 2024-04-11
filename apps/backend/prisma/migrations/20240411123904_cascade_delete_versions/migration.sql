-- DropForeignKey
ALTER TABLE "CodemodVersion" DROP CONSTRAINT "CodemodVersion_codemodId_fkey";

-- AddForeignKey
ALTER TABLE "CodemodVersion" ADD CONSTRAINT "CodemodVersion_codemodId_fkey" FOREIGN KEY ("codemodId") REFERENCES "Codemod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
