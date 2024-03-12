import { createHash, randomBytes } from "crypto";
import { Prisma, TokenMetadata, TokenRevocation } from "@prisma/client";
import {
	EncryptedTokenMetadata,
	KeyIvPair,
	decryptUserId,
	encryptTokenMetadata,
	sign,
	verifyTokenMetadata,
} from "../crypto/crypto.js";
import { DataAccessLayer } from "../db/dataAccessLayer.js";

export const CLAIM_PUBLISHING = BigInt(0x1);
export const CLAIM_ISSUE_CREATION = BigInt(0x2);
export const ALL_CLAIMS = CLAIM_PUBLISHING | CLAIM_ISSUE_CREATION;

const getKeyIvPair = (token: string): KeyIvPair => {
	const buffer = Buffer.from(token, "base64url");

	return {
		key: buffer.subarray(0, 32),
		iv: buffer.subarray(32, 48),
	};
};

const buildPepperedAccessTokenHashDigest = (
	keyIvPair: KeyIvPair,
	pepper: Buffer,
): Buffer =>
	createHash("ripemd160")
		.update(pepper)
		.update(keyIvPair.key)
		.update(keyIvPair.iv)
		.digest();

const buildBufferFromNumber = (value: number | bigint): Buffer => {
	const buffer = Buffer.alloc(8);
	buffer.writeBigUint64BE(typeof value === "bigint" ? value : BigInt(value));

	return buffer;
};

const buildEncryptedTokenMetadata = (
	tokenMetadata: TokenMetadata,
	// userInitializationVector: Buffer,
): EncryptedTokenMetadata => {
	const createdAt = buildBufferFromNumber(tokenMetadata.createdAt);
	const expiresAt = buildBufferFromNumber(tokenMetadata.expiresAt);
	const claims = buildBufferFromNumber(tokenMetadata.claims);

	return {
		// userInitializationVector,
		encryptedUserId: Buffer.from(tokenMetadata.encryptedUserId, "base64url"),
		expiresAt,
		claims,
		createdAt,
		backendInitializationVector: Buffer.from(
			tokenMetadata.backendInitializationVector,
			"base64url",
		),
		signature: Buffer.from(tokenMetadata.signature, "base64url"),
	};
};

export class TokenRevokedError extends Error {}
export class TokenNotFoundError extends Error {}
export class TokenInsufficientClaimsError extends Error {}
export class TokenNotVerifiedError extends Error {}
export class TokenExpiredError extends Error {}

export class TokenService {
	protected _ENCRYPTION_KEY: Buffer;
	protected _SIGNATURE_PRIVATE_KEY: Buffer;
	protected _PEPPER: Buffer;

	public constructor(
		protected _dataAccessLayer: DataAccessLayer,
		ENCRYPTION_KEY: string,
		SIGNATURE_PRIVATE_KEY: string,
		PEPPER: string,
	) {
		this._ENCRYPTION_KEY = Buffer.from(ENCRYPTION_KEY, "base64url");
		this._SIGNATURE_PRIVATE_KEY = Buffer.from(
			SIGNATURE_PRIVATE_KEY,
			"base64url",
		);
		this._PEPPER = Buffer.from(PEPPER, "base64url");
	}

	public async createTokenFromUserId(
		userId: string,
		claims: bigint,
		createdAt: bigint,
		expiresAt: bigint,
	): Promise<string> {
		const userKeyIvPair: KeyIvPair = {
			key: randomBytes(32),
			iv: randomBytes(16),
		};

		const backendKeyIvPair: KeyIvPair = {
			key: this._ENCRYPTION_KEY,
			iv: randomBytes(16),
		};

		const encryptedTokenMetadata = encryptTokenMetadata({
			backendKeyIvPair,
			userKeyIvPair,
			userId: Buffer.from(userId, "utf8"),
			createdAt: buildBufferFromNumber(createdAt),
			expiresAt: buildBufferFromNumber(expiresAt),
			claims: buildBufferFromNumber(claims),
			signaturePrivateKey: this._SIGNATURE_PRIVATE_KEY,
		});

		const pepperedAccessTokenHashDigest = buildPepperedAccessTokenHashDigest(
			userKeyIvPair,
			this._PEPPER,
		).toString("base64url");

		const tokenMetadata: TokenMetadata = {
			pepperedAccessTokenHashDigest: pepperedAccessTokenHashDigest,
			backendInitializationVector: backendKeyIvPair.iv.toString("base64url"),
			encryptedUserId:
				encryptedTokenMetadata.encryptedUserId.toString("base64url"),
			expiresAt,
			claims,
			createdAt,
			signature: encryptedTokenMetadata.signature.toString("base64url"),
		};

		await this._dataAccessLayer.prisma.$transaction(
			[
				this._dataAccessLayer.prisma.tokenMetadata.create({
					data: tokenMetadata,
				}),
			],
			{
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
			},
		);

		return Buffer.concat([userKeyIvPair.key, userKeyIvPair.iv]).toString(
			"base64url",
		);
	}

	public async findUserIdMetadataFromToken(
		accessToken: string,
		now: bigint,
		claims: bigint,
	) {
		const userKeyIvPair = getKeyIvPair(accessToken);

		const pepperedAccessTokenHashDigest = buildPepperedAccessTokenHashDigest(
			userKeyIvPair,
			this._PEPPER,
		).toString("base64url");

		const [tokenMetadata, tokenRevocation] =
			await this._dataAccessLayer.prisma.$transaction(
				[
					this._dataAccessLayer.prisma.tokenMetadata.findUnique({
						where: { pepperedAccessTokenHashDigest },
					}),
					this._dataAccessLayer.prisma.tokenRevocation.findUnique({
						where: { pepperedAccessTokenHashDigest },
					}),
				],
				{
					isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
				},
			);

		if (tokenMetadata === null) {
			throw new TokenNotFoundError();
		}

		if (tokenRevocation !== null) {
			throw new TokenRevokedError();
		}

		const encryptedTokenMetadata = buildEncryptedTokenMetadata(tokenMetadata);

		const verified = verifyTokenMetadata(
			userKeyIvPair,
			encryptedTokenMetadata,
			this._SIGNATURE_PRIVATE_KEY,
		);

		if (!verified) {
			throw new TokenNotVerifiedError();
		}

		const expiresAt = encryptedTokenMetadata.expiresAt.readBigInt64BE();

		if (expiresAt < BigInt(now)) {
			throw new TokenExpiredError();
		}

		if (!(claims & tokenMetadata.claims)) {
			throw new TokenInsufficientClaimsError();
		}

		const userId = decryptUserId(
			{
				key: this._ENCRYPTION_KEY,
				iv: encryptedTokenMetadata.backendInitializationVector,
			},
			userKeyIvPair,
			encryptedTokenMetadata.encryptedUserId,
		);

		return userId.toString("utf8");
	}

	public async revokeToken(
		accessToken: string,
		revokedAt: bigint,
	): Promise<TokenRevocation> {
		const userKeyIvPair = getKeyIvPair(accessToken);

		const pepperedAccessTokenHashDigest = buildPepperedAccessTokenHashDigest(
			userKeyIvPair,
			this._PEPPER,
		);

		const signature = sign(
			Buffer.concat([
				pepperedAccessTokenHashDigest,
				buildBufferFromNumber(revokedAt),
			]),
			this._SIGNATURE_PRIVATE_KEY,
		).toString("base64url");

		const tokenRevocation: TokenRevocation = {
			pepperedAccessTokenHashDigest:
				pepperedAccessTokenHashDigest.toString("base64url"),
			revokedAt,
			signature,
		};

		return this._dataAccessLayer.prisma.$transaction(
			async (tx) => {
				const count = await tx.tokenMetadata.count({
					where: {
						pepperedAccessTokenHashDigest:
							pepperedAccessTokenHashDigest.toString("base64url"),
					},
				});

				if (count === 0) {
					throw new TokenNotFoundError();
				}

				try {
					return await this._dataAccessLayer.prisma.tokenRevocation.create({
						data: tokenRevocation,
					});
				} catch {
					throw new TokenRevokedError();
				}
			},
			{
				isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
			},
		);
	}
}
