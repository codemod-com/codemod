import { describe, expect, test } from 'vitest';
import { prisma } from '../db/prisma.js';
import {
	TokenNotFoundError,
	TokenRevokedError,
	TokenService,
} from './tokenService.js';

describe('TokenService', async () => {
	let encryptionKey = Buffer.from(
		Array.from({ length: 32 }).map((_, i) => i),
	).toString('base64url');

	let signatureKey = Buffer.from(
		Array.from({ length: 16 }).map((_, i) => i),
	).toString('base64url');

	let pepper = Buffer.from(
		Array.from({ length: 16 }).map((_, i) => i),
	).toString('base64url');

	let tokenService = new TokenService(
		prisma,
		encryptionKey,
		signatureKey,
		pepper,
	);

	test('tokenService', async () => {
		// TODO invariant tests

		// TODO this is the minimal length (equal to the key size)
		let userId = Array.from({ length: 16 })
			.map(() => 'A')
			.join('');

		let claims = BigInt(2);
		let createdAt = BigInt(Date.now());
		let expiresAt = BigInt(Date.now() + 1000 * 60 * 60 * 24 * 30);

		let token = await tokenService.createTokenFromUserId(
			userId,
			claims,
			createdAt,
			expiresAt,
		);

		expect(
			await tokenService.findUserIdMetadataFromToken(
				token,
				createdAt,
				BigInt(0b11),
			),
		).toEqual(userId);

		await tokenService.revokeToken(token, BigInt(Date.now()));

		await expect(
			tokenService.findUserIdMetadataFromToken(
				token,
				createdAt,
				BigInt(0b11),
			),
		).rejects.toThrow(TokenRevokedError);
	});

	test('revoking an unexisting token', async () => {
		await expect(
			tokenService.revokeToken('ABCD', BigInt(Date.now())),
		).rejects.toThrow(TokenNotFoundError);
	});

	test('revoking a revoked token', async () => {
		// maximum size (48-1)
		let userId = Array.from({ length: 47 })
			.map(() => 'A')
			.join('');

		let claims = BigInt(2);
		let createdAt = BigInt(Date.now());
		let expiresAt = BigInt(Date.now() + 1000 * 60 * 60 * 24 * 30);

		let token = await tokenService.createTokenFromUserId(
			userId,
			claims,
			createdAt,
			expiresAt,
		);

		await tokenService.revokeToken(token, BigInt(Date.now()));

		await expect(
			tokenService.revokeToken(token, BigInt(Date.now())),
		).rejects.toThrow(TokenRevokedError);
	});
});
