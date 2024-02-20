import { describe, expect, test } from "vitest";
import { buildDataAccessLayer } from "../dataAccessLayer/dataAccessLayer.js";
import {
	TokenNotFoundError,
	TokenRevokedError,
	TokenService,
} from "./tokenService.js";

describe("TokenService", async () => {
	const dataAccessLayer = await buildDataAccessLayer(
		"sqlite::memory:",
		// 'postgres://postgres:postgres@localhost:5432/studio',
	);

	const encryptionKey = Buffer.from(
		Array.from({ length: 32 }).map((_, i) => i),
	).toString("base64url");

	const signatureKey = Buffer.from(
		Array.from({ length: 16 }).map((_, i) => i),
	).toString("base64url");

	const pepper = Buffer.from(
		Array.from({ length: 16 }).map((_, i) => i),
	).toString("base64url");

	const tokenService = new TokenService(
		dataAccessLayer,
		encryptionKey,
		signatureKey,
		pepper,
	);

	test("tokenService", async () => {
		// TODO invariant tests

		// TODO this is the minimal length (equal to the key size)
		const userId = Array.from({ length: 16 })
			.map(() => "A")
			.join("");

		const claims = 2;
		const createdAt = Date.now();
		const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

		const token = await tokenService.createTokenFromUserId(
			userId,
			claims,
			createdAt,
			expiresAt,
		);

		expect(
			await tokenService.findUserIdMetadataFromToken(token, createdAt, 0b11),
		).toEqual(userId);

		await tokenService.revokeToken(token, Date.now());

		await expect(
			tokenService.findUserIdMetadataFromToken(token, createdAt, 0b11),
		).rejects.toThrow(TokenRevokedError);
	});

	test("revoking an unexisting token", async () => {
		await expect(tokenService.revokeToken("ABCD", Date.now())).rejects.toThrow(
			TokenNotFoundError,
		);
	});

	test("revoking a revoked token", async () => {
		// maximum size (48-1)
		const userId = Array.from({ length: 47 })
			.map(() => "A")
			.join("");

		const claims = 2;
		const createdAt = Date.now();
		const expiresAt = Date.now() + 1000 * 60 * 60 * 24 * 30;

		const token = await tokenService.createTokenFromUserId(
			userId,
			claims,
			createdAt,
			expiresAt,
		);

		await tokenService.revokeToken(token, Date.now());

		await expect(tokenService.revokeToken(token, Date.now())).rejects.toThrow(
			TokenRevokedError,
		);
	});
});
