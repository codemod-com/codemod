import { PrismaClient } from "@prisma/client";
import { Input, object, parse, regex, string } from "valibot";
import { coercedNumberSchema } from "./coercedNumberSchema.js";

export type TokenRevocation = Readonly<Input<typeof tokenRevocationSchema>>;

export const tokenRevocationSchema = object({
	// a RIPEMD-160 hash digest has 160 bits = 20 bytes
	// 20 bytes in base64url is ceil(20 * 8 / 6) = 27 characters
	pepperedAccessTokenHashDigest: string([regex(/^[A-Za-z0-9_-]{27}$/)]),
	// number in JS is an 64-bit float (IEEE 754)
	// integers in JS are safe up to 2^53
	// the database has an bigint type that can store 64-bit integers
	// but it returns them as strings
	revokedAt: coercedNumberSchema,
	// a sha256 signature has 256 bits = 32 bytes
	// 32 bytes in base64url is ceil(32 * 8 / 6) = 43 characters
	signature: string([regex(/^[A-Za-z0-9_-]{43}$/)]),
});

export class TokenRevocationRepository {
	public constructor(protected readonly _prismaClient: PrismaClient) {}

	public async create(
		tokenRevocation: TokenRevocation,
	): Promise<TokenRevocation> {
		const instance = await this._prismaClient.tokenRevocation.create({
			data: tokenRevocation,
		});

		return parse(tokenRevocationSchema, instance);
	}

	public async findOne(
		pepperedAccessTokenHashDigest: string,
	): Promise<TokenRevocation | null> {
		const instance = await this._prismaClient.tokenRevocation.findUnique({
			where: { pepperedAccessTokenHashDigest },
		});

		if (instance === null) {
			return null;
		}

		return parse(tokenRevocationSchema, instance);
	}
}
