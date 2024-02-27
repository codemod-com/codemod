import type { ArgvSchema } from "./schema.js";

export const buildPackageJsonData = (argv: ArgvSchema): string => {
	const name = `@codemod-com/registry/${argv.name
		.replace(/\/|\s/gm, "-")
		.toLowerCase()}`;

	const jsEngineUsed = argv.engine !== "recipe" && argv.engine !== "piranha";

	const dependencies: Record<string, string> | undefined = jsEngineUsed
		? {}
		: undefined;

	const devDependencies: Record<string, string> | undefined = jsEngineUsed
		? {
				"@codemod-com/tsconfig": "workspace:*",
				"@codemod-com/utilities": "workspace:*",
				"@codemod-com/registry-cjs-builder": "workspace:*",
				typescript: "^5.2.2",
				esbuild: "0.19.5",
				mocha: "^10.2.0",
				"@types/mocha": "^10.0.4",
				"ts-node": "^10.9.1",
		  }
		: undefined;

	if (
		devDependencies !== undefined &&
		(argv.engine === "jscodeshift" || argv.engine === "filemod")
	) {
		devDependencies.jscodeshift = "^0.15.1";
		devDependencies["@types/jscodeshift"] = "^0.11.10";
	}

	if (
		devDependencies !== undefined &&
		(argv.engine === "ts-morph" || argv.engine === "filemod")
	) {
		devDependencies["ts-morph"] = "^19.0.0";
	}

	if (devDependencies !== undefined && argv.engine === "filemod") {
		devDependencies["@codemod-com/filemod"] = "1.1.0";
		devDependencies.memfs = "^4.6.0";
	}

	const main = jsEngineUsed ? "./dist/index.cjs" : undefined;
	const types = jsEngineUsed ? "/dist/index.d.ts" : undefined;

	const scripts: Record<string, string> | undefined = jsEngineUsed
		? {
				"build:cjs": "cjs-builder ./src/index.ts",
				test: "mocha",
		  }
		: undefined;

	const files: string[] = ["README.md"];

	if (jsEngineUsed) {
		files.push("./dist/index.cjs", "./index.d.ts");
	}

	return JSON.stringify({
		name,
		dependencies,
		devDependencies,
		main,
		types,
		scripts,
		files,
		type: "module",
	});
};
