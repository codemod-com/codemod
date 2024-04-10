-- CreateTable
CREATE TABLE "CodeDiff" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,

    CONSTRAINT "CodeDiff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CodeDiff_id_key" ON "CodeDiff"("id");
