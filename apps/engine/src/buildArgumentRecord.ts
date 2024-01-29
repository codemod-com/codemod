import * as S from '@effect/schema/Schema';
import { ArgumentRecord } from './schemata/argumentRecordSchema.js';

export const buildArgumentRecord = <T extends { [s: string]: unknown }>(
	argv: T,
): ArgumentRecord => {
	const argumentRecord: {
		[P in keyof ArgumentRecord]: ArgumentRecord[P];
	} = {};

	Object.keys(argv)
		.filter((arg) => arg.startsWith('arg:'))
		.forEach((arg) => {
			const key = arg.slice(4);
			const value = argv[arg];

			if (S.is(S.number)(value)) {
				argumentRecord[key] = value;
				return;
			}

			if (!S.is(S.string)(value)) {
				return;
			}

			if (value === 'true') {
				argumentRecord[key] = true;
				return;
			}

			if (value === 'false') {
				argumentRecord[key] = false;
				return;
			}

			argumentRecord[key] = value;
		});

	return argumentRecord;
};
