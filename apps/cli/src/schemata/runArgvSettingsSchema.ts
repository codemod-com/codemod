import { randomBytes } from 'node:crypto';
import { join } from 'node:path';
import * as S from '@effect/schema/Schema';

const runArgvSettingsSchema = S.union(
	S.struct({
		dry: S.optional(S.literal(false)).withDefault(() => false),
	}),
	S.struct({
		dry: S.literal(true),
		output: S.optional(S.string),
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

	if (flowSettings.dry === false) {
		return {
			dryRun: false,
			caseHashDigest,
		};
	}

	if (flowSettings.output !== undefined) {
		return {
			dryRun: true,
			streamingEnabled: false,
			outputDirectoryPath: flowSettings.output,
			caseHashDigest,
		};
	}

	const outputDirectoryPath = join(
		homeDirectoryPath,
		'.codemod',
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
