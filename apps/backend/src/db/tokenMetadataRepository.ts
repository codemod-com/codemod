import { PrismaClient } from "@prisma/client";
import { Input, object, parse, regex, string } from "valibot";
import { coercedNumberSchema } from "./coercedNumberSchema.js";

export const tokenMetadataSchema = object({
	// a RIPEMD-160 hash digest has 160 bits = 20 bytes
	// 20 bytes in base64url is ceil(20 * 8 / 6) = 27 characters
	pepperedAccessTokenHashDigest: string([regex(/^[A-Za-z0-9_-]{27}$/)]),
	// an initialization vector has 128 bits = 16 bytes
	// 16 bytes in base64url is ceil(16 * 8 / 6) = 22 characters
	backendInitializationVector: string([regex(/^[A-Za-z0-9_-]{22}$/)]),
	// encryptedUserId has either 32 or 48 bytes
	// that under base64url is either 43 to 64 characters
	encryptedUserId: string([regex(/^[A-Za-z0-9_-]{43,64}$/)]),
	// number in JS is an 64-bit float (IEEE 754)
	// integers in JS are safe up to 2^53
	// the database has an bigint type that can store 64-bit integers
	// but it returns them as strings
	createdAt: coercedNumberSchema,
	expiresAt: coercedNumberSchema,
	claims: coercedNumberSchema,
	// a sha256 signature has 256 bits = 32 bytes
	// 32 bytes in base64url is ceil(32 * 8 / 6) = 43 characters
	signature: string([regex(/^[A-Za-z0-9_-]{43}$/)]),
});

const prisma = new PrismaClient();

export type TokenMetadata = Readonly<Input<typeof tokenMetadataSchema>>;

export class TokenMetadataRepository {
	public constructor(protected readonly _prismaClient: PrismaClient) {}

	public async create(tokenMetadata: TokenMetadata): Promise<TokenMetadata> {
		const instance = await prisma.tokenMetadata.create({
			data: tokenMetadata,
		});

		return parse(tokenMetadataSchema, instance);
	}

	public async count(pepperedAccessTokenHashDigest: string): Promise<number> {
		const count = await this._prismaClient.tokenMetadata.count({
			where: { pepperedAccessTokenHashDigest },
		});

		return count;
	}

	public async findOne(
		pepperedAccessTokenHashDigest: string,
	): Promise<TokenMetadata | null> {
		const instance = await this._prismaClient.tokenMetadata.findUnique({
			where: { pepperedAccessTokenHashDigest },
		});

		if (!instance) return null;

		return parse(tokenMetadataSchema, instance);
	}
}
