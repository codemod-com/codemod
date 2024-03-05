import { useSession } from "@clerk/nextjs";
import initSwc, { transform } from "@swc/wasm-web";
import * as changeCase from "change-case";
import { js } from "js-beautify";
import JSZip from "jszip";

interface ProjectDownloadInput {
	modBody: string;
	name: string;
	before: string;
	after: string;
	engine: "jscodeshift" | "tsmorph";
	framework?: string;
	version?: string;
	user?: NonNullable<ReturnType<typeof useSession>["session"]>["user"];
}

const beautify = (input: string, options?: Parameters<typeof js>[1]) =>
	js(input, { brace_style: "preserve-inline", indent_size: 2, ...options });

const description = ({
	name,
	before,
	after,
	engine,
	framework,
	version,
	user,
}: ProjectDownloadInput) => {
	const engineLink =
		engine === "jscodeshift"
			? "https://github.com/facebook/jscodeshift"
			: "https://github.com/dsherret/ts-morph";

	const applicabilityText =
		framework && version
			? beautify(`

        ${framework} ${version}

      `)
			: "";

	const userText = user?.username
		? beautify(`
          [${user.username}](https://github.com/${user.username})
        `)
		: "[Anonymous](https://github.com/)";

	return `
# ${changeCase.sentenceCase(name)}

## Examples

### Before

\`\`\`ts
${beautify(before)}
\`\`\`

### After

\`\`\`ts
${beautify(after)}
\`\`\`

## Applicability Criteria
${applicabilityText}
## Other Metadata

### Codemod Version

v0.1.0

### Change Mode (CHOOSE ONE)

**Assistive**: The automation partially completes changes. Human involvement is needed to make changes ready to be pushed and merged.
**Autonomous**: Changes can safely be pushed and merged without further human involvement.

### **Codemod Engine**

[${engine}](${engineLink})

### Estimated Time Saving

### Owner

${userText}
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

const configJson = ({
	framework,
	version,
	name,
	engine,
	user,
}: Pick<
	ProjectDownloadInput,
	"framework" | "version" | "name" | "engine" | "user"
>) => {
	const configName = [
		framework?.toLowerCase(),
		version,
		changeCase.kebabCase(name),
	]
		.filter(Boolean)
		.join("-");

	const finalName = user?.username
		? `@${user.username}/${configName}`
		: configName;

	return beautify(`
      {
        "schemaVersion": "1.0.0",
        "name": "${finalName}",
        "engine": "${engine}"
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
	const packageName = [
		framework?.toLowerCase(),
		version,
		changeCase.kebabCase(name),
	]
		.filter(Boolean)
		.join("-");

	const finalName = user?.username
		? `@${user.username}/${packageName}`
		: packageName;

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
          "esbuild": "0.19.5",
          "vitest": "^1.0.1",
          "@types/node": "20.9.0",
          "typescript": "5.2.2",
          "prettier": "^3.1.0",
          "ts-node": "^10.9.1",
          ${packages.trim()}
        },
        "main": "./dist/index.cjs",
        "types": "/dist/index.d.ts",
        "scripts": {
          "build": "ts-node-esm build.ts ./src/index.ts",
          "test": "vitest run",
          "test:watch": "vitest watch"
        },
        "license": "MIT",
        "files": [
          "DESCRIPTION.md",
          ".codemodrc.json",
          "./dist/index.cjs",
          "./index.d.ts"
        ],
        "type": "module"
      }
  `);
};

const definition = (engine: ProjectDownloadInput["engine"]) => {
	const def = "";

	if (engine === "jscodeshift") {
		return beautify(`
      import type { API, FileInfo } from 'jscodeshift';
      export default function transform(file: FileInfo, api: API): string;
    `);
	}

	if (engine === "tsmorph") {
		return beautify(`
      import type { SourceFile } from 'ts-morph';
      export function handleSourceFile(sourceFile: SourceFile): string | undefined;
    `);
	}

	return def;
};

const testBody = ({
	name,
	before,
	after,
	engine,
}: Pick<ProjectDownloadInput, "name" | "before" | "after" | "engine">) => {
	const body = "";

	if (engine === "jscodeshift") {
		return beautify(`
        import { describe, it } from 'vitest';
        import jscodeshift, { API } from 'jscodeshift';
        import transform from '../src/index.js';
        import assert from 'node:assert';

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

        describe('${name}', function () {
          it('should do the thing', function () {
            const INPUT = \`
${beautify(before, { indent_level: 4 })}
              \`;

            const OUTPUT = \`
${beautify(after, { indent_level: 4 })}
              \`;

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
        });
    `);
	}

	if (engine === "tsmorph") {
		return beautify(`
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

        describe('${name}', function () {
          it('should do the thing', function () {
            const INPUT = \`
${beautify(before, { indent_level: 4 })}
              \`;

            const OUTPUT = \`
${beautify(after, { indent_level: 4 })}
              \`;

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
        });
    `);
	}

	return body;
};

const buildScript = () => {
	return `#!/usr/bin/env node
import esbuild from "esbuild";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";

  const buildCjs = async () => {
  const relativeInputFilePath = process.argv.at(2);

  if (relativeInputFilePath === undefined) {
    throw new Error(
      "You must provide the relativeInputFileName to build the CJS bundle file"
    );
  }

  const relativeOutputFilePath = "./dist/index.cjs";
  const absoluteOutputFilePath = join(process.cwd(), relativeOutputFilePath);

  let licenseBuffer: string;

  try {
    licenseBuffer = (await readFile("./LICENSE", "utf8"))
      .replace(/\\/\\*/gm, "\\\/*")
      .replace(/\\*\\//gm, "*\\\/");
  } catch {
    licenseBuffer = "";
  }

  const options: Parameters<typeof esbuild.build>[0] = {
    entryPoints: [relativeInputFilePath],
    bundle: true,
    packages: "external",
    platform: "node",
    minify: true,
    minifyWhitespace: true,
    format: "cjs",
    legalComments: "inline",
    outfile: relativeOutputFilePath,
    write: false, // to the in-memory file system
  };

  const { outputFiles } = await esbuild.build(options);

  const contents =
    outputFiles?.find((file) => file.path === absoluteOutputFilePath)
      ?.contents ?? null;

  if (contents === null) {
    throw new Error(\`Could not find \${absoluteOutputFilePath} in output files\`);
  }

  const buffer = Buffer.concat([
    Buffer.from("/*! @license\\n"),
    Buffer.from(licenseBuffer),
    Buffer.from("*/\\n"),
    contents,
  ]);

  await mkdir(dirname(absoluteOutputFilePath), { recursive: true });

  await writeFile(absoluteOutputFilePath, buffer);

  return {
    absoluteOutputFilePath,
  };
};

buildCjs()
  .then(({ absoluteOutputFilePath }) => {
    console.log(
      "The bundled CommonJS contents have been written into %s",
      absoluteOutputFilePath
    );
  })
  .catch((error) => {
    console.error(error);
  });
  `;
};

export const downloadProject = async (input: ProjectDownloadInput) => {
	const zip = new JSZip();

	const code = beautify(input.modBody);
	const licenseContent = license(input);

	zip.file("src/index.ts", code);
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

	zip.file("DESCRIPTION.md", description(input));
	zip.file("build.ts", buildScript());

	zip.file("vitest.config.ts", vitestConfig());
	zip.file("index.d.ts", definition(input.engine));

	zip.file("package.json", packageJson(input));
	zip.file("tsconfig.json", tsconfigJson());
	zip.file(".codemodrc.json", configJson(input));

	zip.file(".gitignore", "node_modules\ndist\nbuild.ts");

	const blob = await zip.generateAsync({ type: "blob" });

	// download hack
	const link = document.createElement("a");
	link.href = window.URL.createObjectURL(blob);
	link.download = `${input.name ?? "codemod"}.zip`;
	link.click();
	window.URL.revokeObjectURL(link.href);
};
