import { Codemod } from './codemod.js';
import { ArgumentRecord } from './schemata/argumentRecordSchema.js';

export type SafeArgumentRecord = readonly [ArgumentRecord];

export const buildSafeArgumentRecord = (
	codemod: Codemod,
	argumentRecord: ArgumentRecord,
): SafeArgumentRecord => {
	if (codemod.source === 'fileSystem') {
		// no checks performed for local codemods
		// b/c no source of truth for the arguments
		return [argumentRecord];
	}

	const safeArgumentRecord: [{ [x: string]: string | number | boolean }] = [
		{},
	];

	codemod.arguments
		.concat({ name: 'input', kind: 'string', default: '' })
		.forEach((descriptor) => {
			if (!argumentRecord[descriptor.name]) {
				return;
			}

			const unsafeValue = argumentRecord[descriptor.name];

			console.log(unsafeValue);
			if (typeof unsafeValue === descriptor.kind) {
				safeArgumentRecord[0][descriptor.name] = unsafeValue;
			} else if (descriptor.default !== undefined) {
				safeArgumentRecord[0][descriptor.name] = descriptor.default;
			}
		});

	return safeArgumentRecord;
};
