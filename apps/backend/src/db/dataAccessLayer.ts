import { prisma } from "./prisma";
import { TokenMetadataRepository } from "./tokenMetadataRepository";
import { TokenRevocationRepository } from "./tokenRevocationsRepository";

export const buildDataAccessLayer = async () => {
	const tokenMetadataRepository = new TokenMetadataRepository(prisma);
	const tokenRevocationRepository = new TokenRevocationRepository(prisma);

	return {
		prisma,
		tokenMetadataRepository,
		tokenRevocationRepository,
	};
};

export type DataAccessLayer = Awaited<ReturnType<typeof buildDataAccessLayer>>;
