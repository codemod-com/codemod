import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClerkClient } from "@clerk/fastify";
import {
	codemodConfigSchema,
	isNeitherNullNorUndefined,
	tarPack,
} from "@codemod-com/utilities";
import { RouteHandlerMethod } from "fastify";
import { parse } from "valibot";
import { Environment } from "./schemata/env.js";
import { CLAIM_PUBLISHING, TokenService } from "./services/tokenService.js";
import { areClerkKeysSet, getCustomAccessToken } from "./util.js";

export const publishHandler =
	(environment: Environment, tokenService: TokenService): RouteHandlerMethod =>
	async (request, reply) => {
		try {
			if (!areClerkKeysSet(environment)) {
				throw new Error("This endpoint requires auth configuration.");
			}

			const accessToken = getCustomAccessToken(environment, request.headers);

			if (accessToken === null) {
				return reply
					.code(401)
					.send({ error: "Access token is not present", success: false });
			}

			const userId = await tokenService.findUserIdMetadataFromToken(
				accessToken,
				Date.now(),
				CLAIM_PUBLISHING,
			);

			if (userId === null) {
				return reply
					.code(401)
					.send({ error: "User id was not found", success: false });
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
				return reply.code(400).send({
					error: "No .codemodrc.json file was provided",
					success: false,
				});
			}

			if (!isNeitherNullNorUndefined(indexCjsBuffer)) {
				return reply.code(400).send({
					error: "No index.cjs file was provided",
					success: false,
				});
			}

			if (!isNeitherNullNorUndefined(name)) {
				return reply.code(400).send({
					error: "Codemod name was not provided in codemodrc",
					success: false,
				});
			}

			if (!isNeitherNullNorUndefined(version)) {
				return reply.code(400).send({
					error: "Codemod version was not provided in codemodrc",
					success: false,
				});
			}

			const client = new S3Client({
				credentials: {
					accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
					secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
				},
				region: "us-west-1",
			});

			const buffers = [
				{
					name: ".codemodrc.json",
					data: codemodRcBuffer,
				},
				{
					name: "index.cjs",
					data: indexCjsBuffer,
				},
			];

			if (isNeitherNullNorUndefined(descriptionMdBuffer)) {
				buffers.push({
					name: "description.md",
					data: descriptionMdBuffer,
				});
			}

			const archive = await tarPack(buffers);

			const hashDigest = createHash("ripemd160")
				.update(name)
				.digest("base64url");

			const REQUEST_TIMEOUT = 5000;

			const bucket = isPrivate ? "codemod-private-v2" : "codemod-public-v2";

			await client.send(
				new PutObjectCommand({
					Bucket: bucket,
					Key: `codemod-registry/${hashDigest}/${version}/codemod.tar.gz`,
					Body: archive,
				}),
				{
					requestTimeout: REQUEST_TIMEOUT,
				},
			);

			return reply.code(200).send({ success: true });
		} catch (err) {
			console.error(err);
			return reply
				.code(500)
				.send({ error: (err as Error).message, success: false });
		}
	};
