import { createHash } from "node:crypto";
import * as s3sdk from "@aws-sdk/client-s3";
import * as codemodComUtils from "@codemod-com/utilities";
import supertest from "supertest";
import { afterAll, afterEach, describe, expect, test, vi } from "vitest";
import { runServer } from "./server.js";
import * as utils from "./util.js";

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

vi.mock("@aws-sdk/client-s3", async () => {
	const actual = await vi.importActual("@aws-sdk/client-s3");

	const S3Client = vi.fn();
	S3Client.prototype.send = vi.fn().mockImplementation(() => {
		return { success: true };
	});

	const PutObjectCommand = vi.fn();

	return { ...actual, S3Client, PutObjectCommand };
});

describe("/publish route", async () => {
	const fastify = await runServer();

	afterAll(async () => {
		await fastify.close();
	});

	afterEach(async () => {
		vi.resetAllMocks();
	});

	await fastify.ready();

	test("publishHandler", async () => {
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

		const clientInstance = (s3sdk.S3Client as any).mock.instances[0];
		const putObjectCommandInstance = (s3sdk.PutObjectCommand as any).mock
			.instances[0];

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
});
