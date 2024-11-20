-- CreateTable
CREATE TABLE "ApiKey" (
    "externalId" VARCHAR(255) NOT NULL,
    "key" VARCHAR(255) NOT NULL,
    "keyId" VARCHAR(255) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("key","keyId")
);
