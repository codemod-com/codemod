-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "Codemod" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "owner" VARCHAR(255) NOT NULL,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "frameworks" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "private" BOOLEAN NOT NULL DEFAULT false,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "labels" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Codemod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodemodVersion" (
    "id" SERIAL NOT NULL,
    "version" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "engine" VARCHAR(255) NOT NULL,
    "applicability" JSONB,
    "arguments" JSONB,
    "vsCodeLink" VARCHAR(255) NOT NULL,
    "codemodStudioExampleLink" VARCHAR(255),
    "testProjectCommand" VARCHAR(255),
    "sourceRepo" VARCHAR(255),
    "s3Bucket" VARCHAR(255) NOT NULL,
    "s3UploadKey" VARCHAR(255) NOT NULL,
    "codemodId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodemodVersion_pkey" PRIMARY KEY ("id")
);

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

-- CreateTable
CREATE TABLE "UserLoginIntent" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "token" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserLoginIntent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CodeDiff" (
    "id" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "name" VARCHAR(255),
    "source" VARCHAR(255) NOT NULL,
    "before" TEXT NOT NULL,
    "after" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CodeDiff_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Codemod_slug_key" ON "Codemod"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Codemod_name_key" ON "Codemod"("name");

-- CreateIndex
CREATE INDEX "Codemod_name_idx" ON "Codemod" USING GIN ("name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Codemod_owner_idx" ON "Codemod" USING GIN ("owner" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Codemod_description_idx" ON "Codemod" USING GIN ("description" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "Codemod_frameworks_idx" ON "Codemod" USING GIN ("frameworks" array_ops);

-- CreateIndex
CREATE INDEX "Codemod_tags_idx" ON "Codemod" USING GIN ("tags" array_ops);

-- CreateIndex
CREATE INDEX "CodemodVersion_codemodId_idx" ON "CodemodVersion"("codemodId");

-- CreateIndex
CREATE INDEX "CodemodVersion_createdAt_idx" ON "CodemodVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_title_key" ON "Tag"("title");

-- CreateIndex
CREATE INDEX "Tag_title_idx" ON "Tag"("title");

-- CreateIndex
CREATE INDEX "Tag_aliases_idx" ON "Tag"("aliases");

-- CreateIndex
CREATE UNIQUE INDEX "UserLoginIntent_id_key" ON "UserLoginIntent"("id");

-- CreateIndex
CREATE UNIQUE INDEX "CodeDiff_id_key" ON "CodeDiff"("id");

-- AddForeignKey
ALTER TABLE "CodemodVersion" ADD CONSTRAINT "CodemodVersion_codemodId_fkey" FOREIGN KEY ("codemodId") REFERENCES "Codemod"("id") ON DELETE CASCADE ON UPDATE CASCADE;
