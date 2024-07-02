Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  detectRuntime,
} = require("./runtime/index-browser.js");

const Prisma = {};

exports.Prisma = Prisma;
exports.$Enums = {};

/**
 * Prisma Client JS version: 5.10.2
 * Query Engine version: b9a39a7ee606c28e3455d0fd60e78c3ba82b1a2b
 */
Prisma.prismaVersion = {
  client: "5.10.2",
  engine: "b9a39a7ee606c28e3455d0fd60e78c3ba82b1a2b",
};

Prisma.PrismaClientKnownRequestError = () => {
  throw new Error(`PrismaClientKnownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientUnknownRequestError = () => {
  throw new Error(`PrismaClientUnknownRequestError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientRustPanicError = () => {
  throw new Error(`PrismaClientRustPanicError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientInitializationError = () => {
  throw new Error(`PrismaClientInitializationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.PrismaClientValidationError = () => {
  throw new Error(`PrismaClientValidationError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.NotFoundError = () => {
  throw new Error(`NotFoundError is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.Decimal = Decimal;

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  throw new Error(`sqltag is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.empty = () => {
  throw new Error(`empty is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.join = () => {
  throw new Error(`join is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.raw = () => {
  throw new Error(`raw is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.validator = Public.validator;

/**
 * Extensions
 */
Prisma.getExtensionContext = () => {
  throw new Error(`Extensions.getExtensionContext is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};
Prisma.defineExtension = () => {
  throw new Error(`Extensions.defineExtension is unable to be run ${runtimeDescription}.
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`);
};

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull;
Prisma.JsonNull = objectEnumValues.instances.JsonNull;
Prisma.AnyNull = objectEnumValues.instances.AnyNull;

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull,
};

/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable",
});

exports.Prisma.CodemodScalarFieldEnum = {
  id: "id",
  slug: "slug",
  shortDescription: "shortDescription",
  tags: "tags",
  engine: "engine",
  applicability: "applicability",
  arguments: "arguments",
  name: "name",
  featured: "featured",
  verified: "verified",
  private: "private",
  author: "author",
  amountOfUses: "amountOfUses",
  totalTimeSaved: "totalTimeSaved",
  openedPrs: "openedPrs",
  labels: "labels",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.CodemodVersionScalarFieldEnum = {
  id: "id",
  version: "version",
  shortDescription: "shortDescription",
  engine: "engine",
  applicability: "applicability",
  arguments: "arguments",
  vsCodeLink: "vsCodeLink",
  codemodStudioExampleLink: "codemodStudioExampleLink",
  testProjectCommand: "testProjectCommand",
  sourceRepo: "sourceRepo",
  amountOfUses: "amountOfUses",
  totalTimeSaved: "totalTimeSaved",
  openedPrs: "openedPrs",
  s3Bucket: "s3Bucket",
  s3UploadKey: "s3UploadKey",
  tags: "tags",
  codemodId: "codemodId",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.TagScalarFieldEnum = {
  id: "id",
  title: "title",
  aliases: "aliases",
  classification: "classification",
  displayName: "displayName",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.TokenMetadataScalarFieldEnum = {
  pepperedAccessTokenHashDigest: "pepperedAccessTokenHashDigest",
  backendInitializationVector: "backendInitializationVector",
  encryptedUserId: "encryptedUserId",
  createdAt: "createdAt",
  expiresAt: "expiresAt",
  claims: "claims",
  signature: "signature",
};

exports.Prisma.UserLoginIntentScalarFieldEnum = {
  id: "id",
  token: "token",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.TokenRevocationScalarFieldEnum = {
  pepperedAccessTokenHashDigest: "pepperedAccessTokenHashDigest",
  revokedAt: "revokedAt",
  signature: "signature",
};

exports.Prisma.CodeDiffScalarFieldEnum = {
  id: "id",
  name: "name",
  source: "source",
  before: "before",
  after: "after",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

exports.Prisma.SortOrder = {
  asc: "asc",
  desc: "desc",
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
};

exports.Prisma.QueryMode = {
  default: "default",
  insensitive: "insensitive",
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull,
};

exports.Prisma.NullsOrder = {
  first: "first",
  last: "last",
};

exports.Prisma.ModelName = {
  Codemod: "Codemod",
  CodemodVersion: "CodemodVersion",
  Tag: "Tag",
  TokenMetadata: "TokenMetadata",
  UserLoginIntent: "UserLoginIntent",
  TokenRevocation: "TokenRevocation",
  CodeDiff: "CodeDiff",
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        const runtime = detectRuntime();
        const edgeRuntimeName = {
          workerd: "Cloudflare Workers",
          deno: "Deno and Deno Deploy",
          netlify: "Netlify Edge Functions",
          "edge-light": "Vercel Edge Functions or Edge Middleware",
        }[runtime];

        let message = "PrismaClient is unable to run in ";
        if (edgeRuntimeName !== undefined) {
          message +=
            edgeRuntimeName +
            ". As an alternative, try Accelerate: https://pris.ly/d/accelerate.";
        } else {
          message +=
            "this browser environment, or has been bundled for the browser (running in `" +
            runtime +
            "`).";
        }

        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;

        throw new Error(message);
      },
    });
  }
}

exports.PrismaClient = PrismaClient;

Object.assign(exports, Prisma);
