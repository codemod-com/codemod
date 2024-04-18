import { isNeitherNullNorUndefined } from "@codemod-com/utilities";
import { decrypt, encrypt } from "../crypto/crypto.js";
import type { CustomHandler } from "../customHandler.js";
import { prisma } from "../db/prisma.js";
import { parseBuildAccessTokenQuery } from "../schemata/schema.js";
import { ALL_CLAIMS } from "../services/tokenService.js";

export const buildAccessTokenHandler: CustomHandler<Record<string, never>> =
	async (dependencies) => {
		const { sessionId, iv: ivStr } = parseBuildAccessTokenQuery(
			dependencies.request.query,
		);

		const userId = await dependencies.getClerkUserId();

		const createdAt = BigInt(dependencies.now());
		const expiresAt = createdAt + BigInt(1000 * 60 * 60 * 24 * 14);

		const token = await dependencies.tokenService.createTokenFromUserId(
			userId,
			ALL_CLAIMS, // TODO add proper claims for the VSCE and the CLI
			createdAt,
			expiresAt,
		);

		dependencies.setAccessToken(token);

		if (
			isNeitherNullNorUndefined(sessionId) &&
			isNeitherNullNorUndefined(ivStr)
		) {
			const key = Buffer.from(
				dependencies.environment.ENCRYPTION_KEY,
				"base64url",
			);
			const iv = Buffer.from(ivStr, "base64url");

			const decryptedSessionId = decrypt(
				"aes-256-cbc",
				{ key, iv },
				Buffer.from(sessionId, "base64url"),
			).toString();

			await prisma.userLoginIntent.update({
				where: { id: decryptedSessionId },
				data: {
					token: encrypt(
						"aes-256-cbc",
						{ key, iv },
						Buffer.from(token),
					).toString("base64url"),
				},
			});
		}

		return {};
	};
