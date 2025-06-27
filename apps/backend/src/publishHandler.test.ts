import { createHash } from "node:crypto";

import supertest from "supertest";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

import {
  GONE,
  NO_MAIN_FILE_FOUND,
  UNAUTHORIZED,
} from "@codemod-com/api-types";
import {
  type CodemodConfigInput,
  tarInMemory,
  zipInMemory,
} from "@codemod-com/utilities";

import { runServer } from "./server.js";
import { environment } from "./util.js";

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
    version: "1.0.1",
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
      version: "1.0.1",
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

  const codemodTarBuf = await tarInMemory(fileArray);
  const codemodZipBuf = await zipInMemory(fileArray);

  it("should return 410 if the codemod is new", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
    mocks.prisma.codemod.findUnique.mockImplementation(() => null);

    const expectedCode = 410;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodTarBuf, {
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
      errorText:
        "This endpoint is no longer supported. Please use the new CLI instead.",
      error: GONE,
    });
  });

  it("should go through the happy path with expected result and calling expected stubs (new version of existing codemod)", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
    mocks.prisma.codemod.findUnique.mockImplementation(() => null);
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
      version: "1.0.0",
    }));

    mocks.prisma.codemod.upsert.mockImplementation(() => {
      return { createdAt: { getTime: () => MOCK_TIMESTAMP } };
    });

    const expectedCode = 200;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.tar.gz", codemodTarBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.tar.gz",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")

    console.log("response.body",response.body);

    const hashDigest = createHash("ripemd160")
      .update(codemodRcContents.name)
      .digest("base64url");

    const clientInstance = mocks.S3Client.mock.instances[0];
    const putObjectCommandInstance = mocks.PutObjectCommand.mock.instances[0];

    expect(putObjectCommandInstance.constructor).toHaveBeenCalledOnce();
    expect(putObjectCommandInstance.constructor).toHaveBeenCalledWith({
      Bucket: process.env.AWS_PUBLIC_BUCKET_NAME,
      Key: `codemod-registry/${hashDigest}/${codemodRcContents.version}/codemod.tar.gz`,
      Body: codemodTarBuf,
    });

    expect(clientInstance.send).toHaveBeenCalledOnce();
    expect(clientInstance.send).toHaveBeenCalledWith(putObjectCommandInstance, {
      requestTimeout: 5000,
    });

    expect(response.body).toEqual({
      name: codemodRcContents.name,
      version: codemodRcContents.version,
    });
  });

  it("should go through the happy path when codemod comes as a zip (when codemod is existing)", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);
    mocks.prisma.codemod.findUnique.mockImplementation(() => null);
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
      version: "1.0.0",
    }));

    mocks.prisma.codemod.upsert.mockImplementation(() => {
      return { createdAt: { getTime: () => MOCK_TIMESTAMP } };
    });

    const expectedCode = 200;

    const response = await supertest(fastify.server)
      .post("/publish")
      .set("Authorization", "auth-header")
      .attach("codemod.zip", codemodZipBuf, {
        contentType: "multipart/form-data",
        filename: "codemod.zip",
      })
      .expect((res) => {
        if (res.status !== expectedCode) {
          console.log(JSON.stringify(res.body, null, 2));
        }
      })
      .expect("Content-Type", "application/json; charset=utf-8")
      // .expect(expectedCode);
      console.log("response.body", response.body);

    expect(response.body).toEqual({
      name: codemodRcContents.name,
      version: codemodRcContents.version,
    });
  });

  it("should not allow further execution if required files were not provided", async () => {
    mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

    const expectedCode = 400;

    const archiveWithoutMainFile = await tarInMemory(
      fileArray.filter(
        (f) => f.name !== "/src/index.ts" && f.name !== "/cdmd_dist/index.cjs",
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

  describe("when publishing via org", async () => {
    it("should go through happy path if user has access to the org (when codemod is new)", async () => {
      mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
        version: "1.0.0",
      }));
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
        version: "1.0.1",
        applicability: {
          from: [["eslint", ">=", "12.0.0"]],
        },
        engine: "jscodeshift",
        meta: {
          tags: ["migration"],
        },
      };

      const updatedArchive = await tarInMemory([
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
        version: "1.0.1",
        applicability: {
          from: [["eslint", ">=", "12.0.0"]],
        },
        engine: "jscodeshift",
        meta: {
          tags: ["migration"],
        },
      };

      const updatedArchive = await tarInMemory([
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
