-- CreateTable
CREATE TABLE "CodemodTelemetry" (
    "id" SERIAL NOT NULL,
    "status" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "codemodId" INTEGER NOT NULL,

    CONSTRAINT "CodemodTelemetry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodemodTelemetry_status_key" ON "CodemodTelemetry"("status");

-- AddForeignKey
ALTER TABLE "CodemodTelemetry" ADD CONSTRAINT "CodemodTelemetry_codemodId_fkey" FOREIGN KEY ("codemodId") REFERENCES "Codemod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
