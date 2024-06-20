import { randomBytes } from 'node:crypto';
import { describe, expect, test } from 'vitest';
import {
	type DecryptedTokenMetadata,
	type KeyIvPair,
	decryptUserId,
	encrypt,
	encryptTokenMetadata,
	encryptUserId,
	sign,
	verify,
	verifyTokenMetadata,
} from './crypto.js';

describe('crypto functions', () => {
	test('encryption with aes-128-xts preserves the data length', () => {
		let keyIvPair: KeyIvPair = {
			key: randomBytes(32),
			iv: randomBytes(16),
		};

		for (let i = 16; i < 48; ++i) {
			let data = randomBytes(i);
			let buffer = encrypt('aes-128-xts', keyIvPair, data);

			expect(buffer.length).toEqual(data.length);
		}
	});

	test('encryption with aes-256-cbc ends up with either 32 or 48 bytes', () => {
		let keyIvPair: KeyIvPair = {
			key: randomBytes(32),
			iv: randomBytes(16),
		};

		for (let i = 16; i < 48; ++i) {
			let data = randomBytes(i);
			let buffer = encrypt('aes-256-cbc', keyIvPair, data);

			expect(buffer.length).toEqual(i > 31 ? 48 : 32);
		}
	});

	test('encrypt userId', () => {
		let encryptionKey = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i),
		);

		let initializationVectorB = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 2),
		);

		let accessToken = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i * 3),
		);

		let initializationVectorA = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 4),
		);

		// maximum userId length to be encrypted over 48B is 47B (CBC padding)
		let userId = Array.from({ length: 47 })
			.map((_, i) =>
				String.fromCodePoint(('a'.codePointAt(0) ?? 0) + +(i % 26)),
			)
			.join('');

		let backendCipherParameters = {
			key: encryptionKey,
			iv: initializationVectorB,
		};

		let userCipherParameters = {
			key: accessToken,
			iv: initializationVectorA,
		};

		let encryptedBuffer = encryptUserId({
			backendKeyIvPair: backendCipherParameters,
			userKeyIvPair: userCipherParameters,
			userId: Buffer.from(userId),
		});

		expect(encryptedBuffer.length).toEqual(48);

		let decryptedUserId = decryptUserId(
			backendCipherParameters,
			userCipherParameters,
			encryptedBuffer,
		);

		expect(decryptedUserId.toString()).toEqual(userId);
	});

	test('sign and verify', () => {
		let pepperedAccessTokenHashDigest = randomBytes(20);
		let encryptedUserId = randomBytes(48);
		let expiresAt = randomBytes(8);
		let claims = randomBytes(4);
		let initializationVector = randomBytes(16);

		let data = Buffer.concat([
			pepperedAccessTokenHashDigest,
			encryptedUserId,
			expiresAt,
			claims,
			initializationVector,
		]);

		let signatureKey = randomBytes(16);

		let signature = sign(data, signatureKey);

		expect(signature.length).toEqual(32);

		let verified = verify(data, signatureKey, signature);

		expect(verified).toBeTruthy();
	});

	test('create and verify token object', () => {
		let expiresAt = Buffer.alloc(8);
		expiresAt.writeBigUint64BE(
			BigInt(new Date().getTime() + 1000 * 60 * 60 * 24),
		);

		let encryptionKey = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i),
		);

		let initializationVectorB = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 2),
		);

		let accessToken = Buffer.from(
			Array.from({ length: 32 }).map((_, i) => i * 3),
		);

		let initializationVectorA = Buffer.from(
			Array.from({ length: 16 }).map((_, i) => i * 4),
		);

		let userId = Array.from({ length: 32 })
			.map((_, i) => String.fromCodePoint(('a'.codePointAt(0) ?? 0) + i))
			.join('');

		let privateKey = randomBytes(16);

		let backendCipherParameters = {
			key: encryptionKey,
			iv: initializationVectorB,
		};

		let userCipherParameters = {
			key: accessToken,
			iv: initializationVectorA,
		};

		let decryptedTokenMetadata: DecryptedTokenMetadata = {
			backendKeyIvPair: backendCipherParameters,
			userKeyIvPair: userCipherParameters,
			userId: Buffer.from(userId),
			createdAt: randomBytes(8),
			expiresAt,
			claims: randomBytes(4),
			signaturePrivateKey: privateKey,
		};

		let encryptedTokenMetadata = encryptTokenMetadata(
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

		let verified = verifyTokenMetadata(
			userCipherParameters,
			encryptedTokenMetadata,
			privateKey,
		);
		expect(verified).toBeTruthy();
	});
});
