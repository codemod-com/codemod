import { createHash } from "node:crypto";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { createClerkClient } from "@clerk/fastify";
import {
	CodemodConfig,
	codemodConfigSchema,
	codemodNameRegex,
	isNeitherNullNorUndefined,
	tarPack,
} from "@codemod-com/utilities";
import { RouteHandlerMethod } from "fastify";
import * as semver from "semver";
import { parse } from "valibot";
import { z } from "zod";
import { CodemodVersionCreateInputSchema } from "../prisma/generated/zod";
import { prisma } from "./db/prisma.js";
import { Environment } from "./schemata/env.js";
import { CLAIM_PUBLISHING, TokenService } from "./services/tokenService.js";
import { areClerkKeysSet, getCustomAccessToken } from "./util.js";

// TODO: move
const getS3Url = (bucket: string, region: string) => {
	return `https://${bucket}.s3.${region}.amazonaws.com`;
};

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
				BigInt(Date.now()),
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
			let codemodRc: CodemodConfig | null = null;
			let mainFileBuffer: Buffer | null = null;
			let mainFileName: string | null = null;
			let descriptionMdBuffer: Buffer | null = null;

			for await (const multipartFile of request.files()) {
				const buffer = await multipartFile.toBuffer();

				if (multipartFile.fieldname === ".codemodrc.json") {
					codemodRcBuffer = buffer;

					const codemodRcData = JSON.parse(codemodRcBuffer.toString("utf8"));

					codemodRc = parse(codemodConfigSchema, codemodRcData);

					if (codemodRc.engine === "recipe") {
						if (codemodRc.names.length < 2) {
							throw new Error(
								`The "names" field in .codemodrc.json must contain at least two names for a recipe codemod.`,
							);
						}

						for (const name of codemodRc.names) {
							if (!codemodNameRegex.test(name)) {
								throw new Error(
									`Each entry in the "names" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
								);
							}
						}
					} else if (!codemodNameRegex.test(codemodRc.name)) {
						throw new Error(
							`The "name" field in .codemodrc.json must only contain allowed characters (a-z, A-Z, 0-9, _, /, @ or -)`,
						);
					}
				}

				if (
					["index.cjs", "rules.toml", "rule.yaml"].includes(
						multipartFile.fieldname,
					)
				) {
					mainFileName = multipartFile.fieldname;
					mainFileBuffer = buffer;
				}

				if (multipartFile.fieldname === "description.md") {
					descriptionMdBuffer = buffer;
				}
			}

			if (!isNeitherNullNorUndefined(codemodRcBuffer) || !codemodRc) {
				return reply.code(400).send({
					error: "No .codemodrc.json file was provided",
					success: false,
				});
			}

			if (
				codemodRc.engine !== "recipe" &&
				(!isNeitherNullNorUndefined(mainFileBuffer) ||
					!isNeitherNullNorUndefined(mainFileName))
			) {
				return reply.code(400).send({
					error: "No main file was provided",
					success: false,
				});
			}

			const { name, version } = codemodRc;

			let namespace: string | null = null;
			if (name.startsWith("@") && name.includes("/")) {
				namespace = name.split("/").at(0)?.slice(1)!;

				// TODO:
				// 1. create orgs table and relations
				// 2. check if user is eligible to publish under given org

				// const org = await prisma.organization.findFirst({
				// 	where: {
				// 		name: namespace,
				// 	},
				// });

				// if (org === null) {
				// 	return reply.code(400).send({
				// 		error: `Organization ${namespace} does not exist`,
				// 		success: false,
				// 	});
				// }
			}

			// if publishing under a namespace, then private as a fallback
			// TODO: uncomment when our private bucket and strategy is ready
			// const isPrivate = codemodRc.private ?? !!namespace;
			const isPrivate = false;

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

			const buffers = [
				{
					name: ".codemodrc.json",
					data: codemodRcBuffer,
				},
			];

			if (mainFileBuffer && mainFileName) {
				buffers.push({
					name: mainFileName,
					data: mainFileBuffer,
				});
			}

			if (isNeitherNullNorUndefined(descriptionMdBuffer)) {
				buffers.push({
					name: "description.md",
					data: descriptionMdBuffer,
				});
			}

			const latestVersion = await prisma.codemodVersion.findFirst({
				where: {
					codemod: {
						name,
					},
				},
				orderBy: {
					version: "desc",
				},
				take: 1,
			});

			if (
				latestVersion !== null &&
				!semver.gt(version, latestVersion.version)
			) {
				return reply.code(400).send({
					error: `Codemod ${name} version ${version} is lower than the latest published or the same as the latest published version: ${latestVersion.version}`,
					success: false,
				});
			}

			const archive = await tarPack(buffers);

			const hashDigest = createHash("ripemd160")
				.update(name)
				.digest("base64url");

			const REQUEST_TIMEOUT = 5000;

			const bucket = isPrivate ? "codemod-private-v2" : "codemod-public-v2";

			const registryUrl = getS3Url(bucket, "us-west-1");
			const uploadKeyParts = [hashDigest, version, "codemod.tar.gz"];
			// TODO: uncomment when our private bucket and strategy is ready
			// if (namespace) {
			// 	uploadKeyParts.unshift(namespace);
			// }
			uploadKeyParts.unshift("codemod-registry");
			const uploadKey = uploadKeyParts.join("/");

			const codemodVersionEntry: Omit<
				z.infer<typeof CodemodVersionCreateInputSchema>,
				"codemod"
			> = {
				version,
				bucketLink: `${registryUrl}/${uploadKey}`,
				engine: codemodRc.engine,
				sourceRepo: codemodRc.meta?.git,
				shortDescription: descriptionMdBuffer?.toString("utf-8"),
				vsCodeLink: `vscode://codemod.codemod-vscode-extension/showCodemod?chd=${hashDigest}`,
				applicability: codemodRc.applicability,
				tags: codemodRc.meta?.tags,
				useCaseCategory: codemodRc.meta?.useCaseCategory,
			};

			let isVerified =
				namespace === "codemod.com" || namespace === "codemod-com";
			let author = namespace;
			if (isVerified || environment.VERIFIED_PUBLISHERS.includes(username)) {
				isVerified = true;
				author = "codemod.com";
			}

			if (!author) {
				author = username;
			}

			try {
				await prisma.codemod.upsert({
					where: {
						name,
					},
					create: {
						slug: name
							.replaceAll("@", "")
							.split(/[\/ ,.-]/)
							.join("-"),
						name,
						shortDescription: descriptionMdBuffer?.toString("utf-8"),
						useCaseCategory: codemodRc.meta?.useCaseCategory,
						tags: codemodRc.meta?.tags,
						engine: codemodRc.engine,
						verified: isVerified,
						private: isPrivate,
						author,
						versions: {
							create: codemodVersionEntry,
						},
					},
					update: {
						versions: {
							create: codemodVersionEntry,
						},
					},
				});
			} catch (err) {
				console.error("Failed writing codemod to the database:", err);
				return reply.code(500).send({
					error: `Failed writing codemod to the database: ${
						(err as Error).message
					}`,
					success: false,
				});
			}

			try {
				const client = new S3Client({
					credentials: {
						accessKeyId: environment.AWS_ACCESS_KEY_ID ?? "",
						secretAccessKey: environment.AWS_SECRET_ACCESS_KEY ?? "",
					},
					region: "us-west-1",
				});

				await client.send(
					new PutObjectCommand({
						Bucket: bucket,
						Key: uploadKey,
						Body: archive,
					}),
					{
						requestTimeout: REQUEST_TIMEOUT,
					},
				);
			} catch (err) {
				console.error("Failed uploading codemod to S3:", err);
				await prisma.codemodVersion.deleteMany({
					where: {
						codemod: {
							name,
						},
						version,
					},
				});

				const otherVersions = await prisma.codemodVersion.findMany({
					where: {
						codemod: {
							name,
						},
					},
				});

				if (otherVersions.length === 0) {
					await prisma.codemod.delete({
						where: {
							name,
						},
					});
				}

				return reply.code(500).send({
					error: `Failed publishing to S3: ${(err as Error).message}`,
					success: false,
				});
			}

			return reply.code(200).send({ success: true });
		} catch (err) {
			console.error(err);
			return reply.code(500).send({
				error: `Failed calling publish endpoint: ${(err as Error).message}`,
				success: false,
			});
		}
	};
