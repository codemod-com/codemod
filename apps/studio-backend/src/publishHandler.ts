import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClerkClient } from "@clerk/fastify";
import { RouteHandlerMethod } from "fastify";
import { literal, object, parse, string } from "valibot";
import { Environment } from "./schemata/env.js";
import { CLAIM_PUBLISHING, TokenService } from "./services/tokenService.js";
import { areClerkKeysSet, getCustomAccessToken } from "./util.js";
import {
	codemodConfigSchema,
	isNeitherNullNorUndefined,
} from "@codemod-com/utilities";

export const publishHandler =
	(environment: Environment, tokenService: TokenService): RouteHandlerMethod =>
	async (request, reply) => {
		if (!areClerkKeysSet(environment)) {
			throw new Error("This endpoint requires auth configuration.");
		}

		const accessToken = getCustomAccessToken(environment, request.headers);

		if (accessToken === null) {
			return reply.code(401).send();
		}

		const userId = await tokenService.findUserIdMetadataFromToken(
			accessToken,
			Date.now(),
			CLAIM_PUBLISHING,
		);

		if (userId === null) {
			return reply.code(401).send();
		}

		const clerkClient = createClerkClient({
			publishableKey: environment.CLERK_PUBLISH_KEY,
			secretKey: environment.CLERK_SECRET_KEY,
			jwtKey: environment.CLERK_JWT_KEY,
		});

		const { username } = await clerkClient.users.getUser(userId);

		if (username === null) {
			throw new Error("The username of the current user does not exist");
		}

		let codemodRcBuffer: Buffer | null = null;
		let name: string | null = null;
		let version: string | null = null;
		let isPrivate = false;
		let indexCjsBuffer: Buffer | null = null;
		let descriptionMdBuffer: Buffer | null = null;

		for await (const multipartFile of request.files()) {
			const buffer = await multipartFile.toBuffer();

			if (multipartFile.fieldname === ".codemodrc.json") {
				codemodRcBuffer = buffer;

				const codemodRcData = JSON.parse(codemodRcBuffer.toString("utf8"));

				const codemodRc = parse(codemodConfigSchema, codemodRcData);

				if (
					!("name" in codemodRc) ||
					!/[a-zA-Z0-9_/@-]+/.test(codemodRc.name)
				) {
					throw new Error(
						`The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
					);
				}

				name = codemodRc.name;
				version = codemodRc.version;
				if (codemodRc.private) {
					isPrivate = true;
				}

				// TODO: add check for organization
			}

			if (multipartFile.fieldname === "index.cjs") {
				indexCjsBuffer = buffer;
			}

			if (multipartFile.fieldname === "description.md") {
				descriptionMdBuffer = buffer;
			}
		}

		if (!isNeitherNullNorUndefined(codemodRcBuffer)) {
			throw new Error("Could not find .codemodrc.json file");
		}

		if (!isNeitherNullNorUndefined(indexCjsBuffer)) {
			throw new Error("Could not find index.cjs file");
		}

		if (!isNeitherNullNorUndefined(name)) {
			throw new Error("Codemod name was not provided");
		}

		if (!isNeitherNullNorUndefined(version)) {
			throw new Error("Codemod version was not provided");
		}

		const client = new S3Client({
			credentials: {
				accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
				secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
			},
			region: "us-west-1",
		});

		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const REQUEST_TIMEOUT = 5000;

		const bucket = isPrivate ? "codemod-private-v2" : "codemod-public-v2";

		await client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: `codemod-registry/${hashDigest}/${version}/.codemodrc.json`,
				Body: codemodRcBuffer,
			}),
			{
				requestTimeout: REQUEST_TIMEOUT,
			},
		);

		await client.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: `codemod-registry/${hashDigest}/${version}/index.cjs`,
				Body: indexCjsBuffer,
			}),
			{
				requestTimeout: REQUEST_TIMEOUT,
			},
		);

		if (isNeitherNullNorUndefined(descriptionMdBuffer)) {
			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: `codemod-registry/${hashDigest}/${version}/description.md`,
					Body: descriptionMdBuffer,
				}),
				{
					requestTimeout: REQUEST_TIMEOUT,
				},
			);
		}
	};
