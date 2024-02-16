import { randomBytes } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import {
	DecryptedTokenMetadata,
	decryptUserId,
	encrypt,
	encryptTokenMetadata,
	encryptUserId,
	KeyIvPair,
	sign,
	verify,
	verifyTokenMetadata,
} from './crypto.js';

describe('crypto functions', () => {
	test('encryption with aes-128-xts preserves the data length', () => {
		const keyIvPair: KeyIvPair = {
			key: randomBytes(32),
			iv: randomBytes(16),
		};

		for (let i = 16; i < 48; ++i) {
			const data = randomBytes(i);
			const buffer = encrypt('aes-128-xts', keyIvPair, data);

			expect(buffer.length).toEqual(data.length);
		}
	});

	test('encryption with aes-256-cbc ends up with either 32 or 48 bytes', () => {
		const keyIvPair: KeyIvPair = {
			key: randomBytes(32),
			iv: randomBytes(16),
		};

		for (let i = 16; i < 48; ++i) {
			const data = randomBytes(i);
			const buffer = encrypt('aes-256-cbc', keyIvPair, data);

			expect(buffer.length).toEqual(i > 31 ? 48 : 32);
		}
	});

	test('encrypt userId', () => {
		const encryptionKey = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i),
		);

		const initializationVectorB = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 2),
		);

		const accessToken = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i * 3),
		);

		const initializationVectorA = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 4),
		);

		// maximum userId length to be encrypted over 48B is 47B (CBC padding)
		const userId = Array.from({ length: 47 })
			.map((_, i) =>
				String.fromCodePoint(('a'.codePointAt(0) ?? 0) + +(i % 26)),
			)
			.join('');

		const backendCipherParameters = {
			key: encryptionKey,
			iv: initializationVectorB,
		};

		const userCipherParameters = {
			key: accessToken,
			iv: initializationVectorA,
		};

		const encryptedBuffer = encryptUserId({
			backendKeyIvPair: backendCipherParameters,
			userKeyIvPair: userCipherParameters,
			userId: Buffer.from(userId),
		});

		expect(encryptedBuffer.length).toEqual(48);

		const decryptedUserId = decryptUserId(
			backendCipherParameters,
			userCipherParameters,
			encryptedBuffer,
		);

		expect(decryptedUserId.toString()).toEqual(userId);
	});

	test('sign and verify', () => {
		const pepperedAccessTokenHashDigest = randomBytes(20);
		const encryptedUserId = randomBytes(48);
		const expiresAt = randomBytes(8);
		const claims = randomBytes(4);
		const initializationVector = randomBytes(16);

		const data = Buffer.concat([
			pepperedAccessTokenHashDigest,
			encryptedUserId,
			expiresAt,
			claims,
			initializationVector,
		]);

		const signatureKey = randomBytes(16);

		const signature = sign(data, signatureKey);

		expect(signature.length).toEqual(32);

		const verified = verify(data, signatureKey, signature);

		expect(verified).toBeTruthy();
	});

	test('create and verify token object', () => {
		const expiresAt = Buffer.alloc(8);
		expiresAt.writeBigUint64BE(
			BigInt(new Date().getTime() + 1000 * 60 * 60 * 24),
		);

		const encryptionKey = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i),
		);

		const initializationVectorB = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 2),
		);

		const accessToken = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i * 3),
		);

		const initializationVectorA = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 4),
		);

		const userId = Array.from({ length: 32 })
			.map((_, i) => String.fromCodePoint(('a'.codePointAt(0) ?? 0) + i))
			.join('');

		const privateKey = randomBytes(16);

		const backendCipherParameters = {
			key: encryptionKey,
			iv: initializationVectorB,
		};

		const userCipherParameters = {
			key: accessToken,
			iv: initializationVectorA,
		};

		const decryptedTokenMetadata: DecryptedTokenMetadata = {
			backendKeyIvPair: backendCipherParameters,
			userKeyIvPair: userCipherParameters,
			userId: Buffer.from(userId),
			createdAt: randomBytes(8),
			expiresAt,
			claims: randomBytes(4),
			signaturePrivateKey: privateKey,
		};

		const encryptedTokenMetadata = encryptTokenMetadata(
			decryptedTokenMetadata,
		);

		expect(encryptedTokenMetadata.encryptedUserId.length).toEqual(48);
		expect(encryptedTokenMetadata.createdAt.length).toEqual(8);
		expect(encryptedTokenMetadata.expiresAt.length).toEqual(8);
		expect(encryptedTokenMetadata.claims.length).toEqual(4);
		expect(
			encryptedTokenMetadata.backendInitializationVector.length,
		).toEqual(16);
		expect(encryptedTokenMetadata.signature.length).toEqual(32);

		const verified = verifyTokenMetadata(
			userCipherParameters,
			encryptedTokenMetadata,
			privateKey,
		);
		expect(verified).toBeTruthy();
	});
});
