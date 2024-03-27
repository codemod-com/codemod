import { Codemod } from "./codemod.js";
import { ArgumentRecord } from "./schemata/argumentRecordSchema.js";

export type SafeArgumentRecord = ArgumentRecord;

export const buildSafeArgumentRecord = (
	codemod: Codemod,
	argumentRecord: SafeArgumentRecord,
): SafeArgumentRecord => {
	if (codemod.source === "fileSystem") {
		// no checks performed for local codemods
		// b/c no source of truth for the arguments
		return argumentRecord;
	}

	const safeArgumentRecord: SafeArgumentRecord = {};

	codemod.arguments.forEach((descriptor) => {
		if (!argumentRecord[descriptor.name]) {
			return;
		}

		const unsafeValue = argumentRecord[descriptor.name];

		if (unsafeValue !== undefined && typeof unsafeValue === descriptor.kind) {
			safeArgumentRecord[descriptor.name] = unsafeValue;
		} else if (descriptor.default !== undefined) {
			safeArgumentRecord[descriptor.name] = descriptor.default;
		}
	});

	return safeArgumentRecord;
};
