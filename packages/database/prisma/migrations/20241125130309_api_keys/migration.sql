-- CreateTable
CREATE TABLE "ApiKey" (
    "externalId" VARCHAR(32) NOT NULL,
    "uuid" VARCHAR(36) NOT NULL,
    "keyId" VARCHAR(32) NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("uuid","keyId")
);
