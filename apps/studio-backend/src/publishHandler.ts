import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClerkClient } from "@clerk/fastify";
import { RouteHandlerMethod } from "fastify";
import { literal, object, parse, string } from "valibot";
import { Environment } from "./schema.js";
import { CLAIM_PUBLISHING, TokenService } from "./services/tokenService.js";
import { areClerkKeysSet, getCustomAccessToken } from "./util.js";

const configSchema = object({
	schemaVersion: string(),
	name: string(),
	engine: string(),
});

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

		const user = await clerkClient.users.getUser(userId);

		if (user.username === null) {
			throw new Error("The username of the current user does not exist");
		}

		let configJsonBuffer: Buffer | null = null;
		let name: string | null = null;
		let indexCjsBuffer: Buffer | null = null;
		let descriptionMdBuffer: Buffer | null = null;

		for await (const multipartFile of request.files()) {
			const buffer = await multipartFile.toBuffer();

			if (multipartFile.fieldname === ".codemodrc.json") {
				configJsonBuffer = buffer;

				const configJson = JSON.parse(configJsonBuffer.toString("utf8"));

				const config = parse(configSchema, configJson);

				if (
					!config.name.startsWith(`@${user.username}/`) ||
					!/[a-zA-Z0-9_/-]+/.test(config.name)
				) {
					throw new Error(
						`The "name" field in package.json must start with your GitHub username with a slash (e.g., "@${user.username}/") and contain allowed characters (a-z, A-Z, 0-9, _, / or -)`,
					);
				}

				name = config.name;
			}

			if (multipartFile.fieldname === "index.cjs") {
				indexCjsBuffer = buffer;
			}

			if (multipartFile.fieldname === "description.md") {
				descriptionMdBuffer = buffer;
			}
		}

		if (configJsonBuffer === null || indexCjsBuffer === null || name === null) {
			throw new Error(
				"Could not find either the .codemodrc.json or the index.cjs file",
			);
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

		await client.send(
			new PutObjectCommand({
				Bucket: "codemod-public",
				Key: `codemod-registry/${hashDigest}/.codemodrc.json`,
				Body: configJsonBuffer,
			}),
			{
				requestTimeout: REQUEST_TIMEOUT,
			},
		);

		await client.send(
			new PutObjectCommand({
				Bucket: "codemod-public",
				Key: `codemod-registry/${hashDigest}/index.cjs`,
				Body: indexCjsBuffer,
			}),
			{
				requestTimeout: REQUEST_TIMEOUT,
			},
		);

		if (descriptionMdBuffer !== null) {
			await client.send(
				new PutObjectCommand({
					Bucket: "codemod-public",
					Key: `codemod-registry/${hashDigest}/description.md`,
					Body: descriptionMdBuffer,
				}),
				{
					requestTimeout: REQUEST_TIMEOUT,
				},
			);
		}
	};
