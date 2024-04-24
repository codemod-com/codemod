import { createHash } from "node:crypto";
import * as fs from "node:fs";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import {
	type CodemodConfig,
	TarService,
	codemodNameRegex,
	isNeitherNullNorUndefined,
	parseCodemodConfig,
} from "@codemod-com/utilities";
import * as semver from "semver";
import type { z } from "zod";
import type { CodemodVersionCreateInputSchema } from "../prisma/generated/zod";
import type { CustomHandler } from "./customHandler";
import { prisma } from "./db/prisma.js";
import { CLAIM_PUBLISHING } from "./services/tokenService.js";
import { getCustomAccessToken } from "./util.js";

export const publishHandler: CustomHandler<Record<string, never>> = async ({
	environment,
	tokenService,
	clerkClient,
	request,
	reply,
}) => {
	try {
		if (clerkClient === null) {
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

		const { username } = await clerkClient.users.getUser(userId);
		const orgs = await clerkClient.users.getOrganizationMembershipList({
			userId,
		});

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

				codemodRc = parseCodemodConfig(codemodRcData);

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

			const allowedNamespaces = [
				username,
				...orgs.map((org) => org.organization.slug),
			].filter(isNeitherNullNorUndefined);

			if (!allowedNamespaces.includes(namespace)) {
				return reply.code(403).send({
					error: `You are not allowed to publish under namespace "${namespace}"`,
					success: false,
				});
			}
		}

		// private flag in codemodrc as primary source of truth,
		// fallback is to check if publishing under a namespace. if yes - set to private by default
		const isPrivate = codemodRc.private ?? !!namespace;

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

		if (latestVersion !== null && !semver.gt(version, latestVersion.version)) {
			return reply.code(400).send({
				error: `Codemod ${name} version ${version} is lower than the latest published or the same as the latest published version: ${latestVersion.version}`,
				success: false,
			});
		}

		const tarService = new TarService(fs);
		const archive = await tarService.pack(buffers);

		const hashDigest = createHash("ripemd160").update(name).digest("base64url");

		const REQUEST_TIMEOUT = 5000;

		const bucket =
			isPrivate && namespace ? "codemod-private" : "codemod-public";

		const uploadKeyParts = [hashDigest, version, "codemod.tar.gz"];
		if (isPrivate && namespace) {
			uploadKeyParts.unshift(namespace);
		}
		uploadKeyParts.unshift("codemod-registry");
		const uploadKey = uploadKeyParts.join("/");

		const codemodVersionEntry: Omit<
			z.infer<typeof CodemodVersionCreateInputSchema>,
			"codemod"
		> = {
			version,
			s3Bucket: bucket,
			s3UploadKey: uploadKey,
			engine: codemodRc.engine,
			sourceRepo: codemodRc.meta?.git,
			shortDescription: descriptionMdBuffer?.toString("utf-8"),
			vsCodeLink: `vscode://codemod.codemod-vscode-extension/showCodemod?chd=${hashDigest}`,
			applicability: codemodRc.applicability,
			tags: codemodRc.meta?.tags,
			arguments: codemodRc.arguments,
		};

		let isVerified = namespace === "codemod.com" || namespace === "codemod-com";
		let author = namespace;
		if (!author) {
			if (isVerified || environment.VERIFIED_PUBLISHERS.includes(username)) {
				isVerified = true;
				author = "codemod.com";
			} else {
				author = username;
			}
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
					tags: codemodRc.meta?.tags,
					engine: codemodRc.engine,
					applicability: codemodRc.applicability,
					verified: isVerified,
					private: isPrivate,
					author,
					arguments: codemodRc.arguments,
					versions: {
						create: codemodVersionEntry,
					},
				},
				update: {
					shortDescription: descriptionMdBuffer?.toString("utf-8"),
					tags: codemodRc.meta?.tags,
					engine: codemodRc.engine,
					applicability: codemodRc.applicability,
					private: isPrivate,
					arguments: codemodRc.arguments,
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
