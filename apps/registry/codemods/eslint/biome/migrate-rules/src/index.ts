import { exec } from 'node:child_process';
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { promisify } from 'node:util';
import type { Filemod } from '@codemod-com/filemod';

// import { array, object, optional, record, string } from 'valibot';

// const packageJsonSchema = object({
// 	name: optional(string()),
// 	dependencies: optional(record(string())),
// 	devDependencies: optional(record(string())),
// 	scripts: optional(record(string())),
// 	mocha: optional(record(string())),
// });

// const tsconfigSchema = object({
// 	compilerOptions: optional(object({ types: optional(array(string())) })),
// 	include: optional(array(string())),
// });

export const repomod: Filemod<Record<string, never>, Record<string, string>> = {
	includePatterns: ['**/.*eslintrc.*'],
	initializeState: async (_, prevState) => {
		const state = prevState ?? {};

		console.log(process.cwd());
		const files = await readdir(process.cwd());

		let fileToReadRulesFrom = files.find(
			(file) =>
				path.extname(file) === '.tsx' || path.extname(file) === '.jsx',
		);
		if (!fileToReadRulesFrom) {
			fileToReadRulesFrom = files.find(
				(file) =>
					(!file.endsWith('.d.ts') && path.extname(file) === '.ts') ||
					path.extname(file) === '.js',
			);
		}

		console.log(fileToReadRulesFrom);

		const { stdout: rulesOutput } = await promisify(exec)(
			`npx eslint --print-config ${fileToReadRulesFrom}`,
		);

		// console.log(rulesOutput);

		// const output = await exec(eslint_command, {
		//   encoding: 'utf8',
		//   cwd: path.resolve(values.cwd),
		// });
		// const raw_data = output.stdout;

		// const most_time_consuming_rules = raw_data
		//   .split('\n')
		//   .map((row) => row.split(' ')[0]);
		// const start = rows.findIndex((row) => row.startsWith('$ '));
		// rows = rows.slice(start + 3, rows.length - 2);

		// // Fetch biome rules
		// const markdown_url =
		//   'https://raw.githubusercontent.com/biomejs/biome/main/website/src/content/docs/linter/rules-sources.mdx';
		// const out = await fetch(markdown_url, {
		//   method: 'GET',
		// });
		// const raw_text = await out.text();
		// const biome_rules_raw = raw_text.slice(4).split('\n');

		// const regexp = /\[(.*?)\]/g;
		// const matched_rules = most_time_consuming_rules.flatMap((rule) => {
		//   const matched = biome_rules_raw.find((line) => line.includes(`[${rule}]`));
		//   if (!matched) {
		//     return [];
		//   }

		//   return {
		//     eslint: rule,
		//     biome: matched.match(regexp).at(-1).slice(1, -1),
		//     matched_line: matched,
		//   };
		// });

		return state;
	},
	excludePatterns: ['**/node_modules/**'],
	handleFile: async (_, path, options, state) => {
		if (!state || Object.keys(state).length === 0) {
			return [];
		}
		// if (
		// 	path.endsWith('tsconfig.json') ||
		// 	path.endsWith('package.json') ||
		// 	path.endsWith('.gitignore')
		// ) {
		// 	return [{ kind: 'upsertFile', path, options }];
		// }

		// if (path.includes('mocha')) {
		// 	return [{ kind: 'deleteFile', path }];
		// }

		return [];
	},
	handleData: async (_, path, data) => {
		// if (path.endsWith('package.json')) {
		// 	let packageJson: Input<typeof packageJsonSchema>;
		// 	try {
		// 		const json = JSON.parse(data);
		// 		if (!is(packageJsonSchema, json)) {
		// 			return { kind: 'noop' };
		// 		}
		// 		packageJson = json;
		// 	} catch (err) {
		// 		return { kind: 'noop' };
		// 	}

		// 	// Remove possible "mocha" key and its value
		// 	if (packageJson.mocha) {
		// 		delete packageJson.mocha;
		// 	}

		// 	let mochaDepExists = false;
		// 	// Remove mocha and other mocha-compatibles from dependencies & devDependencies, add vitest devDep
		// 	if (packageJson.dependencies?.mocha) {
		// 		Object.keys(packageJson.dependencies).forEach((dep) => {
		// 			if (dep.includes('mocha')) {
		// 				delete packageJson.dependencies![dep];
		// 			}
		// 		});

		// 		mochaDepExists = true;
		// 	}

		// 	if (packageJson.devDependencies?.mocha) {
		// 		Object.keys(packageJson.devDependencies).forEach((dep) => {
		// 			if (dep.includes('mocha')) {
		// 				delete packageJson.devDependencies![dep];
		// 			}
		// 		});

		// 		mochaDepExists = true;
		// 	}

		// 	let mochaScriptExists = false;

		// 	// Remove commands using mocha
		// 	if (packageJson.scripts) {
		// 		Object.entries(packageJson.scripts).forEach(
		// 			([name, script]) => {
		// 				if (script.includes('mocha')) {
		// 					mochaScriptExists = true;
		// 					delete packageJson.scripts![name];
		// 				}
		// 			},
		// 		);

		// 		// Add vitest commands if current package.json contained any mocha ones
		// 		if (mochaScriptExists) {
		// 			packageJson.scripts = {
		// 				...packageJson.scripts,
		// 				test: 'vitest run',
		// 				'test:watch': 'vitest watch',
		// 				coverage: 'vitest run --coverage',
		// 			};
		// 		}
		// 	}

		// 	if (mochaDepExists || mochaScriptExists) {
		// 		packageJson.devDependencies = {
		// 			...packageJson.devDependencies,
		// 			vitest: '^1.0.1',
		// 			'@vitest/coverage-v8': '^1.0.1',
		// 		};
		// 	}

		// 	return {
		// 		kind: 'upsertData',
		// 		path,
		// 		data: JSON.stringify(packageJson, null, 2),
		// 	};
		// }

		// if (path.endsWith('tsconfig.json')) {
		// 	let tsconfigJson: Input<typeof tsconfigSchema>;
		// 	try {
		// 		const json = JSON.parse(data);
		// 		if (!is(tsconfigSchema, json)) {
		// 			return { kind: 'noop' };
		// 		}
		// 		tsconfigJson = json;
		// 	} catch (err) {
		// 		return { kind: 'noop' };
		// 	}

		// 	// Remove possible `types: ['mocha']`
		// 	if (tsconfigJson.compilerOptions?.types) {
		// 		const newTypes = tsconfigJson.compilerOptions.types.filter(
		// 			(type) => type !== 'mocha',
		// 		);

		// 		if (newTypes.length) {
		// 			tsconfigJson.compilerOptions.types = newTypes;
		// 		} else {
		// 			delete tsconfigJson.compilerOptions.types;
		// 		}
		// 	}
		// 	if (tsconfigJson.include) {
		// 		const newIncludes = tsconfigJson.include.filter(
		// 			(type) => type !== 'mocha',
		// 		);

		// 		if (newIncludes.length) {
		// 			tsconfigJson.include = newIncludes;
		// 		} else {
		// 			delete tsconfigJson.include;
		// 		}
		// 	}

		// 	return {
		// 		kind: 'upsertData',
		// 		path,
		// 		data: JSON.stringify(tsconfigJson, null, 2),
		// 	};
		// }

		// if (path.endsWith('.gitignore')) {
		// 	const expressions = data.split('\n');

		// 	if (
		// 		expressions.some((expression) =>
		// 			expression.trimEnd().endsWith('coverage'),
		// 		)
		// 	) {
		// 		return { kind: 'noop' };
		// 	}

		// 	expressions.push('coverage');

		// 	return {
		// 		kind: 'upsertData',
		// 		path,
		// 		data: expressions.join('\n'),
		// 	};
		// }

		return { kind: 'noop' };
	},
};
