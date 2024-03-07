import type { ArgvSchema } from "./schema.js";

export const buildTsconfigJsonData = (argv: ArgvSchema): string | null => {
	if (argv.engine === "piranha" || argv.engine === "recipe") {
		return null;
	}

	return JSON.stringify({
		extends: "@codemod-com/tsconfig",
		include: [
			"./src/**/*.ts",
			"./src/**/*.js",
			"./test/**/*.ts",
			"./test/**/*.js",
		],
	});
};
