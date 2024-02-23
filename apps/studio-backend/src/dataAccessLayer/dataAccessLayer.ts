import { Sequelize, Transaction } from "sequelize";
import { buildTokenMetadataRepository } from "./buildTokenMetadataRepository.js";
import { buildTokenRevocationRepository } from "./buildTokenRevocationsRepository.js";

export const buildDataAccessLayer = async (uri: string) => {
	const sequelize = new Sequelize(uri, { logging: false });

	const tokenMetadataRepository = buildTokenMetadataRepository(sequelize);
	const tokenRevocationRepository = buildTokenRevocationRepository(sequelize);

	await sequelize.authenticate();

	await sequelize.sync();

	const buildWithTransaction =
		(isolationLevel: Transaction.ISOLATION_LEVELS) =>
		<T>(callback: (transaction: Transaction) => Promise<T>) => {
			return sequelize.transaction(
				{
					autocommit: true,
					isolationLevel,
				},
				callback,
			);
		};

	const withReadCommittedTransaction = buildWithTransaction(
		Transaction.ISOLATION_LEVELS.READ_COMMITTED,
	);

	const withSerializableTransaction = buildWithTransaction(
		Transaction.ISOLATION_LEVELS.SERIALIZABLE,
	);

	return {
		tokenMetadataRepository,
		tokenRevocationRepository,
		withReadCommittedTransaction,
		withSerializableTransaction,
	};
};

export type DataAccessLayer = Awaited<ReturnType<typeof buildDataAccessLayer>>;
