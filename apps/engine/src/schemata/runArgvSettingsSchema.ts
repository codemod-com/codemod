import * as S from '@effect/schema/Schema';
import { randomBytes } from 'node:crypto';
import { join } from 'node:path';

const runArgvSettingsSchema = S.union(
	S.struct({
		dryRun: S.optional(S.literal(false)).withDefault(() => false),
	}),
	S.struct({
		dryRun: S.literal(true),
		outputDirectoryPath: S.optional(S.string),
	}),
);

export type RunSettings =
	| Readonly<{
			dryRun: false;
			caseHashDigest: Buffer;
	  }>
	| Readonly<{
			dryRun: true;
			streamingEnabled: boolean;
			outputDirectoryPath: string;
			caseHashDigest: Buffer;
	  }>;

export const parseRunSettings = (
	homeDirectoryPath: string,
	input: unknown,
): RunSettings => {
	const caseHashDigest = randomBytes(20);

	const flowSettings = S.parseSync(runArgvSettingsSchema)(input);

	if (flowSettings.dryRun === false) {
		return {
			dryRun: false,
			caseHashDigest,
		};
	}

	if (flowSettings.outputDirectoryPath !== undefined) {
		return {
			dryRun: true,
			streamingEnabled: false,
			outputDirectoryPath: flowSettings.outputDirectoryPath,
			caseHashDigest,
		};
	}

	const outputDirectoryPath = join(
		homeDirectoryPath,
		'.intuita',
		'cases',
		caseHashDigest.toString('base64url'),
	);

	return {
		dryRun: true,
		streamingEnabled: true,
		outputDirectoryPath,
		caseHashDigest,
	};
};
