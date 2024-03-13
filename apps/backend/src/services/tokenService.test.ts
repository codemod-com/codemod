import { describe, expect, test, vi } from "vitest";
import { buildDataAccessLayer } from "../db/dataAccessLayer.js";
import {
	TokenNotFoundError,
	TokenRevokedError,
	TokenService,
} from "./tokenService.js";

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

describe("TokenService", async () => {
	const dataAccessLayer = await buildDataAccessLayer();

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

		const claims = BigInt(2);
		const createdAt = BigInt(Date.now());
		const expiresAt = BigInt(Date.now() + 1000 * 60 * 60 * 24 * 30);

		const token = await tokenService.createTokenFromUserId(
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
			tokenService.findUserIdMetadataFromToken(token, createdAt, BigInt(0b11)),
		).rejects.toThrow(TokenRevokedError);
	});

	test("revoking an unexisting token", async () => {
		await expect(
			tokenService.revokeToken("ABCD", BigInt(Date.now())),
		).rejects.toThrow(TokenNotFoundError);
	});

	test("revoking a revoked token", async () => {
		// maximum size (48-1)
		const userId = Array.from({ length: 47 })
			.map(() => "A")
			.join("");

		const claims = BigInt(2);
		const createdAt = BigInt(Date.now());
		const expiresAt = BigInt(Date.now() + 1000 * 60 * 60 * 24 * 30);

		const token = await tokenService.createTokenFromUserId(
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
