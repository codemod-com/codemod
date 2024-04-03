import { Codemod } from "./codemod.js";
import { ArgumentRecord } from "./schemata/argumentRecordSchema.js";

export type SafeArgumentRecord = ArgumentRecord;

export const buildSafeArgumentRecord = (
	codemod: Codemod,
	argumentRecord: SafeArgumentRecord,
): SafeArgumentRecord => {
	if (codemod.source === "standalone") {
		// no checks performed for local codemods
		// b/c no source of truth for the arguments
		return argumentRecord;
	}

	const safeArgumentRecord: SafeArgumentRecord = {};

	const missing: typeof codemod.arguments = [];
	codemod.arguments.forEach((descriptor) => {
		const unsafeValue = argumentRecord[descriptor.name];

		if (
			descriptor.required &&
			unsafeValue === undefined &&
			descriptor.default === undefined
		) {
			missing.push(descriptor);
		}

		if (unsafeValue !== undefined && typeof unsafeValue === descriptor.kind) {
			safeArgumentRecord[descriptor.name] = unsafeValue;
		} else if (descriptor.default !== undefined) {
			safeArgumentRecord[descriptor.name] = descriptor.default;
		}
	});

	if (missing.length > 0) {
		const missingString = `- ${missing
			.map(({ kind, name }) => `"${name}" (${kind})`)
			.join("\n- ")}`;
		throw new Error(
			`Missing required arguments:\n\n${missingString}\n\nPlease provide them as "--<arg-name> <value>".`,
		);
	}

	return safeArgumentRecord;
};
