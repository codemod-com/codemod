import { useSession } from "@clerk/nextjs";
import initSwc, { transform } from "@swc/wasm-web";
import * as changeCase from "change-case";
import { js } from "js-beautify";
import JSZip from "jszip";

interface ProjectDownloadInput {
	modBody: string;
	name: string;
	cases: { before: string; after: string }[];
	engine: "jscodeshift" | "tsmorph";
	framework?: string;
	version?: string;
	user?: NonNullable<ReturnType<typeof useSession>["session"]>["user"];
}

const beautify = (input: string, options?: Parameters<typeof js>[1]) =>
	js(input, { brace_style: "preserve-inline", indent_size: 2, ...options });

const readme = ({ name, cases }: ProjectDownloadInput) => {
	return `
# ${changeCase.sentenceCase(name)}

## Description

## Examples
${cases.map(({ before, after }, i) => {
	return `
### Before

\`\`\`ts
${beautify(before)}
\`\`\`

### After

\`\`\`ts
${beautify(after)}
\`\`\`
`;
})}
`;
};

const license = ({ user }: Pick<ProjectDownloadInput, "user">) => {
	return `
The MIT License (MIT)

Copyright (c) 2023${user?.username ? ` ${user.username}` : ""}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;
};

const vitestConfig = () => {
	return beautify(`
	import { configDefaults, defineConfig } from 'vitest/config';

	export default defineConfig({
    test: {
      include: [...configDefaults.include, '**/test/*.ts'],
    },
  });
	`);
};

const codemodRc = ({
	name,
	engine,
	user,
}: Pick<
	ProjectDownloadInput,
	"framework" | "version" | "name" | "engine" | "user"
>) => {
	const finalName = changeCase.kebabCase(name);

	return beautify(`
    {
      "$schema": "https://codemod-utils.s3.us-west-1.amazonaws.com/configuration_schema.json",
      "version": "1.0.0",
      "private": false,
      "name": "${finalName}",
      "engine": "${engine}",
      "meta": {}
    }
	`);
};

const tsconfigJson = () => {
	return beautify(`
    {
      "compilerOptions": {
        "outDir": "./dist",
        "esModuleInterop": true,
        "forceConsistentCasingInFileNames": true,
        "isolatedModules": true,
        "module": "NodeNext",
        "skipLibCheck": true,
        "strict": true,
        "target": "ES6",
        "allowJs": true
      },
      "include": [
        "./src/**/*.ts",
        "./src/**/*.js",
        "./test/**/*.ts",
        "./test/**/*.js"
      ],
      "exclude": ["node_modules", "./dist/**/*"],
      "ts-node": {
        "transpileOnly": true
      }
    }
	`);
};

const packageJson = ({
	framework,
	version,
	name,
	engine,
	user,
}: Pick<
	ProjectDownloadInput,
	"framework" | "version" | "name" | "engine" | "user"
>) => {
	const finalName = changeCase.kebabCase(name);

	let packages = "";
	if (engine === "jscodeshift") {
		packages = `
	    "jscodeshift": "^0.15.1",
      "@types/jscodeshift": "^0.11.10"
    `;
	} else if (engine === "tsmorph") {
		packages = `
      "ts-morph": "^20.0.0"
    `;
	}

	return beautify(`
      {
        "name": "${finalName}",
        "dependencies": {},
        "devDependencies": {
          "vitest": "^1.0.1",
          "@types/node": "20.9.0",
          "typescript": "5.2.2",
          "prettier": "^3.1.0",
          "ts-node": "^10.9.1",
          ${packages.trim()}
        },
        "main": "./dist/index.cjs",
                "scripts": {
          "test": "vitest run",
          "test:watch": "vitest watch"
        },
        "license": "MIT",
        "files": [
          "README.md",
          ".codemodrc.json",
          "./dist/index.cjs",
        ],
        "type": "module"
      }
  `);
};

const testBody = ({
	name,
	cases,
	engine,
}: Pick<ProjectDownloadInput, "name" | "engine" | "cases">) => {
	let body = "";

	if (engine === "jscodeshift") {
		body = beautify(`
        import { describe, it } from 'vitest';
        import jscodeshift, { API } from 'jscodeshift';
        import transform from '../src/index.js';
        import assert from 'node:assert';
        import { readFile } from 'node:fs/promises';
        import { join } from 'node:path';

        const buildApi = (parser: string | undefined): API => ({
          j: parser ? jscodeshift.withParser(parser) : jscodeshift,
          jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
          stats: () => {
            console.error(
              'The stats function was called, which is not supported on purpose',
            );
          },
          report: () => {
            console.error(
              'The report function was called, which is not supported on purpose',
            );
          },
        });

        describe('${name}', () => {
          ${cases.map((_, i) => {
						return beautify(
							`it('test #${i + 1}', async () => {
                const INPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture${
									i + 1
								}.input.ts'), 'utf-8');
                const OUTPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture${
									i + 1
								}.output.ts'), 'utf-8');

                const actualOutput = transform(
                  {
                    path: 'index.js',
                    source: INPUT,
                  },
                  buildApi('tsx'),
                );

                assert.deepEqual(
                  actualOutput?.replace(/\W/gm, ''),
                  OUTPUT.replace(/\W/gm, ''),
                );
              });
            `,
							{ indent_level: 4 },
						);
					})}
        });
    `);
	}

	if (engine === "tsmorph") {
		body = beautify(`
        import { handleSourceFile } from '../src/index.js';
        import { Project } from 'ts-morph';
        import assert from 'node:assert';
        import { extname } from 'node:path';

        const transform = (beforeText: string, afterText: string, path: string) => {
          const project = new Project({
            useInMemoryFileSystem: true,
            skipFileDependencyResolution: true,
            compilerOptions: {
              allowJs: true,
            },
          });

          const actualSourceFile = project.createSourceFile(path, beforeText);

          const actual = handleSourceFile(actualSourceFile)?.replace(/\s/gm, '');

          const expected = project
            .createSourceFile(\`expected\${extname(path)}\`, afterText)
            .getFullText()
            .replace(/\s/gm, '');

          return {
            actual,
            expected,
          };
        };

        describe('${name}', () => {
          ${cases.map((_, i) => {
						return beautify(
							`
              it('test #${i + 1}', () => {
                const INPUT = await readFile('../__testfixtures__/fixture${
									i + 1
								}.input.ts', 'utf-8');
                const OUTPUT = await readFile('../__testfixtures__/fixture${
									i + 1
								}.output.ts', 'utf-8');

                const { actual, expected } = transform(
                  beforeText,
                  afterText,
                  'index.tsx',
                );

                assert.deepEqual(
                  actualOutput,
                  OUTPUT,
                );
              });
            `,
							{ indent_level: 4 },
						);
					})}
        });
    `);
	}

	return body;
};

export const downloadProject = async (input: ProjectDownloadInput) => {
	const zip = new JSZip();

	const code = beautify(input.modBody);
	const licenseContent = license(input);

	zip.file("src/index.ts", code);
	for (let i = 0; i < input.cases.length; i++) {
		const { before, after } = input.cases[i]!;

		zip.file(`__testfixtures__/fixture${i + 1}.input.ts`, beautify(before));
		zip.file(`__testfixtures__/fixture${i + 1}.output.ts`, beautify(after));
	}

	zip.file("test/test.ts", testBody(input));
	zip.file("LICENSE", licenseContent);

	await initSwc();
	const { code: compiled } = await transform(code, {
		minify: true,
		module: { type: "commonjs" },
		jsc: {
			target: "es5",
			loose: false,
			parser: { syntax: "typescript", tsx: true },
		},
	});

	zip.file(
		"dist/index.cjs",
		`/*! @license\n${licenseContent}\n*/\n${compiled}`,
	);

	zip.file("README.md", readme(input));

	zip.file("vitest.config.ts", vitestConfig());

	zip.file("package.json", packageJson(input));
	zip.file("tsconfig.json", tsconfigJson());
	zip.file(".codemodrc.json", codemodRc(input));

	zip.file(".gitignore", "node_modules\ndist");

	const blob = await zip.generateAsync({ type: "blob" });

	// download hack
	const link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	link.download = `${input.name}.zip`;
	link.click();
	window.URL.revokeObjectURL(link.href);
};
