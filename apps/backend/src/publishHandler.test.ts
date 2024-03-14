import { createHash } from "node:crypto";
import * as codemodComUtils from "@codemod-com/utilities";
import supertest from "supertest";
import { afterAll, afterEach, describe, expect, it, vi } from "vitest";
import { runServer } from "./server.js";
import * as utils from "./util.js";

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
			},
		},
		S3Client,
		PutObjectCommand,
	};
});

vi.mock("./db/prisma.js", async () => {
	return { prisma: mocks.prisma };
});

vi.mock("@aws-sdk/client-s3", async () => {
	const actual = await vi.importActual("@aws-sdk/client-s3");

	return {
		...actual,
		S3Client: mocks.S3Client,
		PutObjectCommand: mocks.PutObjectCommand,
	};
});

vi.mock("./schemata/env.js", async () => {
	const actual = await vi.importActual("./schemata/env.js");

	return {
		...actual,
		parseEnvironment: vi.fn().mockImplementation(() => {
			return {
				PORT: "8081",
				DATABASE_URI: "sqlite://:memory:",
				CLERK_PUBLISH_KEY: "CLERK_PUBLISH_KEY",
				CLERK_SECRET_KEY: "CLERK_SECRET_KEY",
				CLERK_JWT_KEY: "CLERK_JWT_KEY",
			};
		}),
	};
});

vi.mock("./util.js", async () => {
	const actual = await vi.importActual("./util.js");

	return {
		...actual,
		areClerkKeysSet: vi.fn().mockImplementation(() => true),
		getCustomAccessToken: () => vi.fn().mockImplementation(() => "accessToken"),
	};
});

vi.mock("./util.js", async () => {
	const actual = await vi.importActual("./util.js");

	return {
		...actual,
		areClerkKeysSet: vi.fn().mockImplementation(() => true),
		getCustomAccessToken: () => vi.fn().mockImplementation(() => "accessToken"),
	};
});

vi.mock("@codemod-com/utilities", async () => {
	const actual = await vi.importActual("@codemod-com/utilities");

	const tarPack = vi.fn().mockImplementation(() => "archive");
	const hashDigest = "hashDigest";

	return {
		...actual,
		tarPack,
		hashDigest,
	};
});

vi.mock("@clerk/fastify", async () => {
	const actual = await vi.importActual("@clerk/fastify");

	return {
		...actual,
		createClerkClient: vi.fn().mockImplementation(() => {
			return {
				users: {
					getUser: vi.fn().mockImplementation(() => ({ username: "username" })),
				},
			};
		}),
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

describe("/publish route", async () => {
	const fastify = await runServer();

	afterAll(async () => {
		await fastify.close();
	});

	afterEach(async () => {
		vi.clearAllMocks();
	});

	await fastify.ready();

	const areClerkKeysSpy = vi.spyOn(utils, "areClerkKeysSet");
	const getCustomAccessTokenSpy = vi.spyOn(utils, "getCustomAccessToken");

	const tarPackSpy = vi.spyOn(codemodComUtils, "tarPack");

	const codemodRcContents: codemodComUtils.CodemodConfigInput = {
		name: "mycodemod",
		version: "1.0.0",
		private: false,
		applicability: [["eslint", ">=", "12.0.0"]],
		// Can be deprecated?
		// description: "description",
		engine: "jscodeshift",
		meta: {
			changeType: "assistive",
			timeSave: "5m",
			type: "migration",
		},
	};

	const codemodRcBuf = Buffer.from(JSON.stringify(codemodRcContents), "utf8");
	const indexCjsBuf = Buffer.from("Code...", "utf8");
	const readmeBuf = Buffer.from("README", "utf8");

	it("should go through the happy path with expected result and calling expected stubs", async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

		const expectedCode = 200;

		const response = await supertest(fastify.server)
			.post("/publish")
			.attach(".codemodrc.json", codemodRcBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("index.cjs", indexCjsBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("description.md", readmeBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.expect((res) => {
				if (res.status !== expectedCode) {
					console.log(JSON.stringify(res.body, null, 2));
				}
			})
			.expect("Content-Type", "application/json; charset=utf-8")
			.expect(expectedCode);

		expect(areClerkKeysSpy).toHaveBeenCalledOnce();
		expect(getCustomAccessTokenSpy).toHaveBeenCalledOnce();

		expect(tarPackSpy).toHaveBeenCalledOnce();
		expect(tarPackSpy).toHaveBeenCalledWith([
			{
				name: ".codemodrc.json",
				data: codemodRcBuf,
			},
			{
				name: "index.cjs",
				data: indexCjsBuf,
			},
			{
				name: "description.md",
				data: readmeBuf,
			},
		]);
		expect(tarPackSpy).toReturnWith("archive");

		const hashDigest = createHash("ripemd160")
			.update(codemodRcContents.name)
			.digest("base64url");

		const clientInstance = mocks.S3Client.mock.instances[0];
		const putObjectCommandInstance = mocks.PutObjectCommand.mock.instances[0];

		expect(putObjectCommandInstance.constructor).toHaveBeenCalledOnce();
		expect(putObjectCommandInstance.constructor).toHaveBeenCalledWith({
			Bucket: "codemod-public-v2",
			Key: `codemod-registry/${hashDigest}/${codemodRcContents.version}/codemod.tar.gz`,
			Body: "archive",
		});

		expect(clientInstance.send).toHaveBeenCalledOnce();
		expect(clientInstance.send).toHaveBeenCalledWith(putObjectCommandInstance, {
			requestTimeout: 5000,
		});

		expect(response.body).toEqual({ success: true });
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
			.attach(".codemodrc.json", codemodRcBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("index.cjs", indexCjsBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("description.md", readmeBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
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
			error: `Failed writing codemod to the database: ${errorMsg}`,
			success: false,
		});
	});

	it("should fail to publish if a codemod with provided version already exists", async () => {
		mocks.prisma.codemodVersion.findFirst.mockImplementation(() => ({
			version: "1.0.0",
		}));

		const expectedCode = 400;

		const response = await supertest(fastify.server)
			.post("/publish")
			.attach(".codemodrc.json", codemodRcBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("index.cjs", indexCjsBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
			})
			.attach("description.md", readmeBuf, {
				contentType: "multipart/form-data",
				filename: ".codemodrc.json",
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
			error: `Codemod ${codemodRcContents.name} version ${codemodRcContents.version} is lower than the latest published or the same as the latest published version: 1.0.0`,
			success: false,
		});
	});

	describe("when s3 upload fails", async () => {
		it("should delete the appropriate version from the database if other versions exist", async () => {
			mocks.prisma.codemodVersion.findFirst.mockImplementation(() => null);

			mocks.prisma.codemod.upsert.mockImplementation(() => {
				return { id: "id" };
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
				.attach(".codemodrc.json", codemodRcBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
				})
				.attach("index.cjs", indexCjsBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
				})
				.attach("description.md", readmeBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
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
				error: `Failed publishing to S3: ${errorMsg}`,
				success: false,
			});
		});

		it("should delete the appropriate version from the database AND the codemod itself if no other versions exist", async () => {
			mocks.prisma.codemod.upsert.mockImplementation(() => {
				return { id: "id" };
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
				.attach(".codemodrc.json", codemodRcBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
				})
				.attach("index.cjs", indexCjsBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
				})
				.attach("description.md", readmeBuf, {
					contentType: "multipart/form-data",
					filename: ".codemodrc.json",
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

			expect(mocks.prisma.codemod.delete).toHaveBeenCalledOnce();
			expect(mocks.prisma.codemod.delete).toHaveBeenCalledWith({
				where: {
					name: codemodRcContents.name,
				},
			});

			expect(response.body).toEqual({
				error: `Failed publishing to S3: ${errorMsg}`,
				success: false,
			});
		});
	});
});
