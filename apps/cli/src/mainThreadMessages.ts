import * as S from '@effect/schema/Schema';
import { argumentRecordSchema } from './schemata/argumentRecordSchema.js';

const mainThreadMessageSchema = S.union(
	S.struct({
		kind: S.literal('initialization'),
		codemodPath: S.string,
		codemodSource: S.string,
		codemodEngine: S.union(S.literal('jscodeshift'), S.literal('ts-morph')),
		formatWithPrettier: S.boolean,
		safeArgumentRecord: S.tuple(argumentRecordSchema),
	}),
	S.struct({
		kind: S.literal('exit'),
	}),
	S.struct({
		kind: S.literal('runCodemod'),
		path: S.string,
		data: S.string,
	}),
);

export type MainThreadMessage = S.To<typeof mainThreadMessageSchema>;

export const decodeMainThreadMessage = S.parseSync(mainThreadMessageSchema);
