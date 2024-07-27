import { createHash } from "node:crypto";

import supertest from "supertest";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
  CODEMOD_NAME_TAKEN,
  CODEMOD_VERSION_EXISTS,
  INTERNAL_SERVER_ERROR,
  NO_MAIN_FILE_FOUND,
  UNAUTHORIZED,
} from "@codemod-com/api-types";
import { BUILT_SOURCE_PATH } from "@codemod-com/runner/dist/source-code.js";
import type { CodemodConfigInput } from "@codemod-com/utilities";

import { runServer } from "./server.js";

const GET_USER_RETURN = {
  user: {
    username: "username",
    primaryEmailAddressId: "123",
    emailAddresses: [{ id: "123", emailAddress: "john.doe@gmail.com" }],
    firstName: "John",
    lastName: "Doe",
  },
  organizations: [{ organization: { slug: "org" } }],
  allowedNamespaces: ["org"],
};

const MOCK_TIMESTAMP = "timestamp";

const mocks = vi.hoisted(() => {
  const S3Client = vi.fn();
  S3Client.prototype.send = vi.fn();

  const PutObjectCommand = vi.fn();

  return {
    prisma: {
      codemodVersion: {
        deleteMany: vi.fn(),
        findMany: vi.fn(),
        findFirst: vi.fn(),
      },
      codemod: {
        upsert: vi.fn(),
        delete: vi.fn(),
        findUnique: vi.fn(),
      },
    },
    axios: {
      get: vi.fn().mockImplementation((url: string, ...args: unknown[]) => ({
        data: GET_USER_RETURN,
      })),
      post: vi.fn().mockImplementation(() => ({})),
    },
    S3Client,
    PutObjectCommand,
  };
});

vi.mock("@codemod-com/database", async () => {
  const actual = await vi.importActual("@codemod-com/database");

  return { ...actual, prisma: mocks.prisma };
});

vi.mock("axios", async () => {
  return { default: mocks.axios };
});

vi.mock("@aws-sdk/client-s3", async () => {
  const actual = await vi.importActual("@aws-sdk/client-s3");

  return {
    ...actual,
    S3Client: mocks.S3Client,
    PutObjectCommand: mocks.PutObjectCommand,
  };
});

vi.mock("./services/tokenService.js", async () => {
  const actual = await vi.importActual("./services/tokenService.js");

  const TokenService = vi.fn();
  TokenService.prototype.findUserIdMetadataFromToken = vi
    .fn()
    .mockImplementation(() => "userId");

  return { ...actual, TokenService };
});

vi.stubGlobal("fetch", vi.fn());

describe("/publish route", async () => {
  const fastify = await runServer();

  afterAll(async () => {
    await fastify.close();
  });

  afterEach(async () => {
    vi.clearAllMocks();
  });

  await fastify.ready();

  const codemodRcContents: CodemodConfigInput = {
    name: "mycodemod",
    version: "1.0.0",
    private: false,
    applicability: {
      from: [["eslint", ">=", "12.0.0"]],
    },
    engine: "jscodeshift",
    meta: {
      tags: ["migration"],
    },
  };

  const codemodRcBuf = Buffer.from(JSON.stringify(codemodRcContents), "utf8");
  const entryFileBuf = Buffer.from("Code...", "utf8");
  const builtFileBuf = Buffer.from("Code...", "utf8");
  const readmeBuf = Buffer.from("README", "utf8");
  const packageJsonBuf = Buffer.from(
    JSON.stringify({
      name: "mycodemod",
      version: "1.0.0",
      main: "index.cjs",
    }),
    "utf8",
  );

  const fileArray: { name: string; data: Buffer }[] = [
    { name: ".codemodrc.json", data: codemodRcBuf },
    { name: "package.json", data: packageJsonBuf },
    { name: "/src/index.ts", data: entryFileBuf },
    { name: "/cdmd_dist/index.cjs", data: builtFileBuf },
    { name: "README.md", data: readmeBuf },
  ];

  const codemodArchiveBuf = await tarinm(fileArray);

  it("should go through the happy path with expected result and calling expected stubs", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
    mocks.prisma.codemod.findUnique.mockImplementation(() => null);

    mocks.prisma.codemod.upsert.mockImplementation(() => {
      return { createdAt: { getTime: () => MOCK_TIMESTAMP } };
    });

    const expectedCode = 200;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodArchiveBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(expectedCode);

    const hashDigest = createHash("ripemd160")
      .update(codemodRcContents.name)
      .digest("base64url");

    const clientInstance = mocks.S3Client.mock.instances[0];
    const putObjectCommandInstance = mocks.PutObjectCommand.mock.instances[0];

    expect(putObjectCommandInstance.constructor).toHaveBeenCalledOnce();
    expect(putObjectCommandInstance.constructor).toHaveBeenCalledWith({
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `codemod-registry/${hashDigest}/${codemodRcContents.version}/codemod.tar.gz`,
      Body: codemodArchiveBuf,
    });

    expect(clientInstance.send).toHaveBeenCalledOnce();
    expect(clientInstance.send).toHaveBeenCalledWith(putObjectCommandInstance, {
      requestTimeout: 5000,
    });

    expect(mocks.axios.post).toHaveBeenCalledOnce();
    expect(mocks.axios.post).toHaveBeenCalledWith(
      "https://hooks.zapier.com/hooks/catch/18983913/2ybuovt/",
      {
        codemod: {
          name: codemodRcContents.name,
          from: codemodRcContents.applicability?.from?.map((tuple) =>
            tuple.join(" "),
          ),
          to: codemodRcContents.applicability?.to?.map((tuple) =>
            tuple.join(" "),
          ),
          engine: codemodRcContents.engine,
          publishedAt: MOCK_TIMESTAMP,
        },
        author: {
          username: GET_USER_RETURN.user.username,
          name: `${GET_USER_RETURN.user.firstName} ${GET_USER_RETURN.user.lastName}`,
          email: GET_USER_RETURN.user.emailAddresses[0]?.emailAddress,
        },
      },
    );

    expect(response.body).toEqual({
      name: codemodRcContents.name,
      version: codemodRcContents.version,
    });
  });

  it("should not allow further execution if required files were not provided", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

    const expectedCode = 400;

    const archiveWithoutMainFile = await tarService.pack(
      fileArray.filter(
        (f) => f.name !== "/src/index.ts" && f.name !== BUILT_SOURCE_PATH,
      ),
    );

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", archiveWithoutMainFile, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(expectedCode);

    expect(response.body).toEqual({
      error: NO_MAIN_FILE_FOUND,
      errorText: "No main file was provided",
    });
  });

  it("when db write fails, it should fail with 500 and return the error message", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

    const errorMsg = "Test error";
    mocks.prisma.codemod.upsert.mockImplementation(() => {
      throw new Error(errorMsg);
    });

    const expectedCode = 500;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodArchiveBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(expectedCode);

    expect(mocks.prisma.codemod.upsert).toHaveBeenCalledOnce();

    // anything related to s3 should not happen
    expect(mocks.S3Client.mock.instances.length).toEqual(0);
    expect(mocks.PutObjectCommand.mock.instances.length).toEqual(0);

    expect(response.body).toEqual({
      error: INTERNAL_SERVER_ERROR,
      errorText: `Failed writing codemod to the database: ${errorMsg}`,
    });
  });

  it("should fail to publish if a codemod with provided version already exists", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
      version: "1.0.0",
    }));

    const expectedCode = 400;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodArchiveBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(expectedCode);

    expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

    expect(response.body).toEqual({
      error: CODEMOD_VERSION_EXISTS,
      errorText: `Codemod ${codemodRcContents.name} version ${codemodRcContents.version} is lower than the latest published or the same as the latest published version: 1.0.0`,
    });
  });

  it("should fail to publish a codemod from a certain author if another author already took the name", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
    mocks.prisma.codemod.findUnique.mockImplementationOnce(() => ({
      version: "1.0.0",
    }));

    const expectedCode = 400;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodArchiveBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      .expect(expectedCode);

    expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

    expect(response.body).toEqual({
      error: CODEMOD_NAME_TAKEN,
      errorText: `Codemod name \`${codemodRcContents.name}\` is already taken.`,
    });
  });

  describe("when s3 upload fails", async () => {
    it("should delete the appropriate version from the database if other versions exist", async () => {
      mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

      mocks.prisma.codemod.upsert.mockImplementation(() => {
        return {
          createdAt: { getTime: () => MOCK_TIMESTAMP },
          id: "id",
        };
      });

      const errorMsg = "Test error";
      mocks.S3Client.prototype.send = vi.fn().mockImplementation(() => {
        throw new Error(errorMsg);
      });

      mocks.prisma.codemodVersion.findMany = vi.fn().mockImplementation(() => {
        return [{ version: "1.0.0" }, { version: "1.0.1" }];
      });

      const expectedCode = 500;

      const response = await supertest(fastify.server)
        .post("/publish")
        .set("Authorization", "auth-header")
        .attach("codemod.tar.gz", codemodArchiveBuf, {
          contentType: "multipart/form-data",
          filename: "codemod.tar.gz",
        })
        .expect((res) => {
          if (res.status !== expectedCode) {
            console.log(JSON.stringify(res.body, null, 2));
          }
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(expectedCode);

      const hashDigest = createHash("ripemd160")
        .update(codemodRcContents.name)
        .digest("base64url");

      const clientInstance = mocks.S3Client.mock.instances[0];

      expect(clientInstance.send).toHaveBeenCalledOnce();
      expect(clientInstance.send).toThrowError(errorMsg);

      expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledOnce();
      expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledWith({
        where: {
          codemod: {
            name: codemodRcContents.name,
          },
          version: codemodRcContents.version,
        },
      });

      expect(response.body).toEqual({
        error: INTERNAL_SERVER_ERROR,
        errorText: `Failed publishing to S3: ${errorMsg}`,
      });
    });

    it("should delete the appropriate version from the database AND the codemod itself if no other versions exist", async () => {
      mocks.prisma.codemod.upsert.mockImplementation(() => {
        return { createdAt: { getTime: () => MOCK_TIMESTAMP }, id: "id" };
      });

      const errorMsg = "Test error";
      mocks.S3Client.prototype.send = vi.fn().mockImplementation(() => {
        throw new Error(errorMsg);
      });

      mocks.prisma.codemodVersion.findMany = vi.fn().mockImplementation(() => {
        return [];
      });

      const expectedCode = 500;

      const response = await supertest(fastify.server)
        .post("/publish")
        .set("Authorization", "auth-header")
        .attach("codemod.tar.gz", codemodArchiveBuf, {
          contentType: "multipart/form-data",
          filename: "codemod.tar.gz",
        })
        .expect((res) => {
          if (res.status !== expectedCode) {
            console.log(JSON.stringify(res.body, null, 2));
          }
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(expectedCode);

      const clientInstance = mocks.S3Client.mock.instances[0];

      expect(clientInstance.send).toHaveBeenCalledOnce();
      expect(clientInstance.send).toThrowError(errorMsg);

      expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledOnce();
      expect(mocks.prisma.codemodVersion.deleteMany).toHaveBeenCalledWith({
        where: {
          codemod: {
            name: codemodRcContents.name,
          },
          version: codemodRcContents.version,
        },
      });

      expect(mocks.prisma.codemod.delete).toHaveBeenCalledOnce();
      expect(mocks.prisma.codemod.delete).toHaveBeenCalledWith({
        where: {
          name: codemodRcContents.name,
        },
      });

      expect(response.body).toEqual({
        error: INTERNAL_SERVER_ERROR,
        errorText: `Failed publishing to S3: ${errorMsg}`,
      });
    });
  });

  describe("when publishing via org", async () => {
    it("should go through happy path if user has access to the org", async () => {
      mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
      mocks.axios.get.mockImplementation(() => ({
        data: { ...GET_USER_RETURN, allowedNamespaces: ["org"] },
      }));
      mocks.prisma.codemod.upsert.mockImplementation(() => {
        return { createdAt: { getTime: () => MOCK_TIMESTAMP }, id: "id" };
      });
      mocks.S3Client.prototype.send = vi.fn().mockImplementation(() => ({}));

      mocks.prisma.codemodVersion.findMany = vi.fn().mockImplementation(() => {
        return [];
      });

      const codemodRcContents: CodemodConfigInput = {
        name: "@org/mycodemod",
        version: "1.0.0",
        applicability: {
          from: [["eslint", ">=", "12.0.0"]],
        },
        engine: "jscodeshift",
        meta: {
          tags: ["migration"],
        },
      };

      const updatedArchive = await tarService.pack([
        ...fileArray.filter((f) => f.name !== ".codemodrc.json"),
        {
          name: ".codemodrc.json",
          data: Buffer.from(JSON.stringify(codemodRcContents), "utf8"),
        },
      ]);

      const expectedCode = 200;

      const response = await supertest(fastify.server)
        .post("/publish")
        .set("Authorization", "auth-header")
        .attach("codemod.tar.gz", updatedArchive, {
          contentType: "multipart/form-data",
          filename: "codemod.tar.gz",
        })
        .expect((res) => {
          if (res.status !== expectedCode) {
            console.log(JSON.stringify(res.body, null, 2));
          }
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(expectedCode);

      const clientInstance = mocks.S3Client.mock.instances[0];
      expect(clientInstance.send).toHaveBeenCalledOnce();

      expect(response.body).toEqual({
        name: codemodRcContents.name,
        version: codemodRcContents.version,
      });
    });

    it("should fail if user has no access to the org", async () => {
      mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
      mocks.axios.get.mockImplementation(() => ({
        data: { ...GET_USER_RETURN, organizations: [], allowedNamespaces: [] },
      }));

      const codemodRcContents: CodemodConfigInput = {
        name: "@org/mycodemod",
        version: "1.0.0",
        applicability: {
          from: [["eslint", ">=", "12.0.0"]],
        },
        engine: "jscodeshift",
        meta: {
          tags: ["migration"],
        },
      };

      const updatedArchive = await tarService.pack([
        ...fileArray.filter((f) => f.name !== ".codemodrc.json"),
        {
          name: ".codemodrc.json",
          data: Buffer.from(JSON.stringify(codemodRcContents), "utf8"),
        },
      ]);

      const expectedCode = 403;

      const response = await supertest(fastify.server)
        .post("/publish")
        .set("Authorization", "auth-header")
        .attach("codemod.tar.gz", updatedArchive, {
          contentType: "multipart/form-data",
          filename: "codemod.tar.gz",
        })
        .expect((res) => {
          if (res.status !== expectedCode) {
            console.log(JSON.stringify(res.body, null, 2));
          }
        })
        .expect("Content-Type", "application/json; charset=utf-8")
        .expect(expectedCode);

      expect(mocks.prisma.codemod.upsert).toHaveBeenCalledTimes(0);

      expect(response.body).toEqual({
        error: UNAUTHORIZED,
        errorText: `You are not allowed to publish under namespace "org"`,
      });
    });
  });
});
