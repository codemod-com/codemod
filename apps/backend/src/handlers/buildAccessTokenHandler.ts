import { isNeitherNullNorUndefined } from '@codemod-com/utilities';
import { decrypt, encrypt } from '../crypto/crypto.js';
import type { CustomHandler } from '../customHandler.js';
import { prisma } from '../db/prisma.js';
import { parseBuildAccessTokenQuery } from '../schemata/schema.js';
import { ALL_CLAIMS } from '../services/tokenService.js';

export let buildAccessTokenHandler: CustomHandler<
	Record<string, never>
> = async (dependencies) => {
	let { sessionId, iv: ivStr } = parseBuildAccessTokenQuery(
		dependencies.request.query,
	);

	let userId = await dependencies.getClerkUserId();

	let createdAt = BigInt(dependencies.now());
	let expiresAt = createdAt + BigInt(1000 * 60 * 60 * 24 * 14);

	let token = await dependencies.tokenService.createTokenFromUserId(
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
		let key = Buffer.from(
			dependencies.environment.ENCRYPTION_KEY,
			'base64url',
		);
		let iv = Buffer.from(ivStr, 'base64url');

		let decryptedSessionId = decrypt(
			'aes-256-cbc',
			{ key, iv },
			Buffer.from(sessionId, 'base64url'),
		).toString();

		await prisma.userLoginIntent.update({
			where: { id: decryptedSessionId },
			data: {
				token: encrypt(
					'aes-256-cbc',
					{ key, iv },
					Buffer.from(token),
				).toString('base64url'),
			},
		});
	}

	return {};
};
