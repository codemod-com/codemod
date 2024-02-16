import {
	DataTypes,
	Model,
	ModelStatic,
	Sequelize,
	Transaction,
} from 'sequelize';
import { Input, object, parse, regex, string } from 'valibot';
import { coercedNumberSchema } from './schemata.js';

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

export type TokenRevocation = Readonly<Input<typeof tokenRevocationSchema>>;

class TokenRevocationRepository {
	public constructor(
		protected readonly _model: ModelStatic<
			Model<TokenRevocation, TokenRevocation>
		>,
	) {}

	public async create(
		tokenRevocation: TokenRevocation,
		transaction: Transaction,
	): Promise<TokenRevocation> {
		const instance = await this._model.create(tokenRevocation, {
			transaction,
		});

		return parse(tokenRevocationSchema, instance.toJSON());
	}

	public async findOne(
		pepperedAccessTokenHashDigest: string,
		transaction: Transaction,
	): Promise<TokenRevocation | null> {
		const instance = await this._model.findOne({
			where: {
				pepperedAccessTokenHashDigest,
			},
			transaction,
		});

		if (instance === null) {
			return null;
		}

		return parse(tokenRevocationSchema, instance.toJSON());
	}
}

export const buildTokenRevocationRepository = (
	sequelize: Sequelize,
): TokenRevocationRepository => {
	class TokenMetadataModel extends Model<TokenRevocation, TokenRevocation> {}

	TokenMetadataModel.init(
		{
			pepperedAccessTokenHashDigest: {
				type: DataTypes.STRING(Math.ceil((20 * 8) / 6)),
				primaryKey: true,
				field: 'pathd',
			},
			revokedAt: {
				type: DataTypes.BIGINT(),
				allowNull: false,
				field: 'r',
			},
			signature: {
				type: DataTypes.STRING(Math.ceil((32 * 8) / 6)),
				allowNull: false,
				field: 's',
			},
		},
		{
			sequelize,
			tableName: 'tokenRevocations',
			timestamps: false,
		},
	);

	return new TokenRevocationRepository(TokenMetadataModel);
};
