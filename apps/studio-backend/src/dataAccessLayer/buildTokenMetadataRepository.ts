import {
	DataTypes,
	Model,
	ModelStatic,
	Sequelize,
	Transaction,
} from "sequelize";
import { Input, object, parse, regex, string } from "valibot";
import { coercedNumberSchema } from "./schemata.js";

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

export type TokenMetadata = Readonly<Input<typeof tokenMetadataSchema>>;

class TokenMetadataRepository {
	public constructor(
		protected readonly _model: ModelStatic<Model<TokenMetadata, TokenMetadata>>,
	) {}

	public async create(
		tokenMetadata: TokenMetadata,
		transaction: Transaction,
	): Promise<TokenMetadata> {
		const instance = await this._model.create(tokenMetadata, {
			transaction,
		});

		return parse(tokenMetadataSchema, instance.toJSON());
	}

	public async count(
		pepperedAccessTokenHashDigest: string,
		transaction: Transaction,
	): Promise<number> {
		return this._model.count({
			where: {
				pepperedAccessTokenHashDigest,
			},
			transaction,
		});
	}

	public async findOne(
		pepperedAccessTokenHashDigest: string,
		transaction: Transaction,
	): Promise<TokenMetadata | null> {
		const instance = await this._model.findOne({
			where: {
				pepperedAccessTokenHashDigest,
			},
			transaction,
		});

		if (instance === null) {
			return null;
		}

		return parse(tokenMetadataSchema, instance.toJSON());
	}
}

export const buildTokenMetadataRepository = (
	sequelize: Sequelize,
): TokenMetadataRepository => {
	class TokenMetadatumModel extends Model<TokenMetadata> {}

	TokenMetadatumModel.init(
		{
			pepperedAccessTokenHashDigest: {
				type: DataTypes.STRING(Math.ceil((20 * 8) / 6)),
				primaryKey: true,
				field: "pathd",
			},
			backendInitializationVector: {
				type: DataTypes.STRING(Math.ceil((16 * 8) / 6)),
				allowNull: false,
				field: "biv",
			},
			encryptedUserId: {
				type: DataTypes.STRING(Math.ceil((48 * 8) / 6)),
				allowNull: false,
				field: "euid",
			},
			createdAt: {
				type: DataTypes.BIGINT(),
				allowNull: false,
				field: "ca",
			},
			expiresAt: {
				type: DataTypes.BIGINT(),
				allowNull: false,
				field: "ea",
			},
			claims: {
				type: DataTypes.BIGINT(),
				allowNull: false,
				field: "c",
			},
			signature: {
				type: DataTypes.STRING(Math.ceil((32 * 8) / 6)),
				allowNull: false,
				field: "s",
			},
		},
		{
			sequelize,
			tableName: "tokenMetadata",
			timestamps: false,
			name: {
				singular: "tokenMetadatum",
				plural: "tokenMetadata",
			},
		},
	);

	return new TokenMetadataRepository(TokenMetadatumModel);
};
