import * as changeCase from "change-case";
import jsBeautify from "js-beautify";

import baseTsconfig from "@codemod-com/tsconfig/base.json";
import codemodTsconfig from "@codemod-com/tsconfig/codemod.json";
import { isNeitherNullNorUndefined } from "./functions/validation.js";
import {
  type CodemodConfigInput,
  type KnownEngines,
  type KnownEnginesCodemodConfigValidationInput,
  type RecipeCodemodConfigValidationInput,
  parseCodemodConfig,
} from "./schemata/codemod-config.js";

const { js } = jsBeautify;
export interface ProjectDownloadInput {
  codemodBody?: string;
  codemodRcBody?: CodemodConfigInput;
  name: string;
  engine: KnownEngines | "tsmorph" | "recipe";

  license?: "MIT" | "Apache 2.0";
  vanillaJs?: boolean;
  gitUrl?: string;
  version?: string;
  cases?: { before: string; after: string }[];
  username: string | null;
  tags?: string[];
}

type FixtureInputFile = `__testfixtures__/fixture${number}.input.js`;
type FixtureOutputFile = `__testfixtures__/fixture${number}.output.js`;

type FixtureInputFileTypeScript = `__testfixtures__/fixture${number}.input.ts`;
type FixtureOutputFileTypeScript =
  `__testfixtures__/fixture${number}.output.ts`;

export type CodemodProjectOutput =
  | JavaScriptProjectFiles
  | TypeScriptProjectFiles
  | AstGrepProjectFiles;
type BaseProjectFiles = {
  "README.md": string;
  ".codemodrc.json": string;
};
type JsProjectAdditionalFiles = {
  "package.json": string;
  ".gitignore": string;
};
export type JavaScriptProjectFiles = BaseProjectFiles &
  JsProjectAdditionalFiles & {
    "src/index.js": string;
    "test/test.js": string;
    "vitest.config.js": string;
    [key: FixtureInputFile]: string;
    [key: FixtureOutputFile]: string;
  };
export type TypeScriptProjectFiles = BaseProjectFiles &
  JsProjectAdditionalFiles & {
    "src/index.ts": string;
    "test/test.ts": string;
    "vitest.config.ts": string;
    "tsconfig.json": string;
    [key: FixtureInputFileTypeScript]: string;
    [key: FixtureOutputFileTypeScript]: string;
  };
export type AstGrepProjectFiles = BaseProjectFiles & {
  "src/rule.yaml": string;
};

export function isJavaScriptProjectFiles(
  files: CodemodProjectOutput,
): files is JavaScriptProjectFiles {
  return "src/index.js" in files;
}
export function isTypeScriptProjectFiles(
  files: CodemodProjectOutput,
): files is TypeScriptProjectFiles {
  return "src/index.ts" in files;
}
export function isAstGrepProjectFiles(
  files: CodemodProjectOutput,
): files is AstGrepProjectFiles {
  return "src/rule.yaml" in files;
}

const beautify = (input: string, options?: Parameters<typeof js>[1]) =>
  js(input, { brace_style: "preserve-inline", indent_size: 2, ...options });

const readme = ({ cases, name }: ProjectDownloadInput) => {
  const packageName = changeCase.kebabCase(name);

  return `
This is a [Codemod](https://codemod.com) created with [\`\`\`codemod init\`\`\`](https://docs.codemod.com/deploying-codemods/cli#codemod-init).

## Using this codemod
You can run this codemod with the following command:
\`\`\`bash
npx codemod ${packageName}
\`\`\`

${cases?.map(({ before, after }) => {
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
  tags,
  version,
  gitUrl,
  codemodRcBody,
}: ProjectDownloadInput) => {
  const finalName = changeCase.kebabCase(name);

  let codemodConfig: CodemodConfigInput;

  if (isNeitherNullNorUndefined(codemodRcBody)) {
    codemodConfig = parseCodemodConfig(codemodRcBody);
  } else if (engine === "recipe") {
    codemodConfig = parseCodemodConfig({
      $schema:
        "https://codemod-utils.s3.us-west-1.amazonaws.com/configuration_schema.json",
      version: version ?? "1.0.0",
      private: false,
      name: finalName,
      names: [],
      engine,
      meta: {
        ...(tags && tags.length > 0 && { tags }),
      },
    } satisfies RecipeCodemodConfigValidationInput);
  } else {
    codemodConfig = parseCodemodConfig({
      $schema:
        "https://codemod-utils.s3.us-west-1.amazonaws.com/configuration_schema.json",
      version: version ?? "1.0.0",
      private: false,
      name: finalName,
      engine: engine === "tsmorph" ? "ts-morph" : engine,
      meta: {
        ...(tags && tags.length > 0 && { tags }),
      },
    } satisfies KnownEnginesCodemodConfigValidationInput);
  }

  if (gitUrl) {
    codemodConfig.meta = { ...codemodConfig.meta, git: gitUrl };
  }

  return beautify(JSON.stringify(codemodConfig, null, 2));
};

const tsconfigJson = () => {
  return beautify(`
    {
      "compilerOptions": ${JSON.stringify(
        {
          ...baseTsconfig.compilerOptions,
          ...codemodTsconfig.compilerOptions,
        },
        null,
        2,
      )},
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

const packageJson = ({ name, engine, username }: ProjectDownloadInput) => {
  const finalName = changeCase.kebabCase(name);

  const content: {
    name: string;
    author?: string;
    files: string[];
    type: "module";
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
    scripts?: Record<string, string>;
  } = {
    name: finalName,
    devDependencies: {},
    scripts: {},
    files: ["README.md", ".codemodrc.json"],
    type: "module",
  };

  const devDeps: Record<string, string> = {};
  const scripts: Record<string, string> = {};

  if (engine !== "recipe") {
    devDeps["@types/node"] = "20.9.0";
    devDeps.typescript = "^5.2.2";
    devDeps.vitest = "^1.0.1";
    devDeps["@codemod.com/codemod-utils"] = "*";
    scripts.test = "vitest run";
    scripts["test:watch"] = "vitest watch";
    content.files.push("/dist/index.cjs");
  }

  if (username) {
    content.author = username;
  }

  if (engine === "jscodeshift") {
    devDeps.jscodeshift = "^0.15.1";
    devDeps["@types/jscodeshift"] = "^0.11.10";
  } else if (engine === "ts-morph" || engine === "tsmorph") {
    devDeps["ts-morph"] = "^20.0.0";
  } else if (engine === "filemod") {
    devDeps["@codemod-com/filemod"] = "^2.0.0";
  } else if (engine === "workflow") {
    devDeps["@codemod.com/workflow"] = "*";
  }

  if (Object.keys(devDeps).length) {
    content.devDependencies = devDeps;
  }

  if (Object.keys(scripts).length) {
    content.scripts = scripts;
  }

  return beautify(JSON.stringify(content, null, 2));
};

const testBody = ({
  name,
  cases,
  engine,
  vanillaJs,
}: Pick<ProjectDownloadInput, "name" | "engine" | "cases" | "vanillaJs">) => {
  let body = "";

  if (engine === "jscodeshift") {
    body = beautify(`
        import { describe, it } from 'vitest';
        import jscodeshift${vanillaJs ? "" : ", { type API }"} from 'jscodeshift';
        import transform from '../src/index.js';
        import assert from 'node:assert';
        import { readFile } from 'node:fs/promises';
        import { join } from 'node:path';

        const buildApi = (parser: string | undefined)${vanillaJs ? "" : ": API"} => ({
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
          ${cases
            ?.map((_, i) => {
              return beautify(
                `it('test #${i + 1}', async () => {
                const INPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture${
                  i + 1
                }.input.${vanillaJs ? "js" : "ts"}'), 'utf-8');
                const OUTPUT = await readFile(join(__dirname, '..', '__testfixtures__/fixture${
                  i + 1
                }.output.${vanillaJs ? "js" : "ts"}'), 'utf-8');

                const actualOutput = transform(
                  {
                    path: 'index.js',
                    source: INPUT,
                  },
                  buildApi('tsx'),
                  {}
                );

                assert.deepEqual(
                  actualOutput?.replace(/\W/gm, ''),
                  OUTPUT.replace(/\W/gm, ''),
                );
              });
            `,
                { indent_level: 4 },
              );
            })
            .join("\n\n")}
        });
    `);
  }

  if (engine === "ts-morph" || engine === "tsmorph") {
    body = beautify(`
        import { describe, it } from 'vitest';
        import { readFile } from 'node:fs/promises';
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

          const actual = handleSourceFile(actualSourceFile)?.replace(/\\s/gm, '');

          const expected = project
            .createSourceFile(\`expected\${extname(path)}\`, afterText)
            .getFullText()
            .replace(/\\s/gm, '');

          return {
            actual,
            expected,
          };
        };

        describe('${name}', () => {
          ${cases?.map((_, i) => {
            return beautify(
              `
              it('test #${i + 1}', async () => {
                const INPUT = await readFile('../__testfixtures__/fixture${
                  i + 1
                }.input.ts', 'utf-8');
                const OUTPUT = await readFile('../__testfixtures__/fixture${
                  i + 1
                }.output.ts', 'utf-8');

                const { actual, expected } = transform(
                  INPUT,
                  OUTPUT,
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

export function getCodemodProjectFiles(
  input: ProjectDownloadInput,
): CodemodProjectOutput;
export function getCodemodProjectFiles(
  input: ProjectDownloadInput &
    ({ engine: Exclude<KnownEngines, "ast-grep"> } | { vanillaJs: false }),
): TypeScriptProjectFiles;
export function getCodemodProjectFiles(
  input: ProjectDownloadInput & { vanillaJs: true },
): JavaScriptProjectFiles;
export function getCodemodProjectFiles(
  input: ProjectDownloadInput & { engine: "ast-grep" },
): AstGrepProjectFiles;
export function getCodemodProjectFiles(input: ProjectDownloadInput) {
  let mainFileBoilerplate: string;

  if (input.engine === "recipe") {
    return {
      "README.md": readme(input),
      "package.json": packageJson(input),
      ".codemodrc.json": codemodRc(input),
    };
  }

  switch (input.engine) {
    case "jscodeshift":
      mainFileBoilerplate = emptyJsCodeShiftBoilerplate;
      break;
    case "tsmorph":
    case "ts-morph":
      mainFileBoilerplate = emptyTsMorphBoilerplate;
      break;
    case "filemod":
      mainFileBoilerplate = emptyFilemodBoilerplate;
      break;
    case "ast-grep":
      mainFileBoilerplate = emptyAstGrepBoilerplate;
      break;
    case "workflow":
      mainFileBoilerplate = emptyWorkflowBoilerplate;
      break;
    default:
      throw new Error(`Unknown engine: ${input.engine}`);
  }

  if (input.cases === undefined) {
    input.cases = [
      {
        before: `const toReplace = "hello";`,
        after: `const replacement = "hello";`,
      },
    ];
  }

  const mainFileContent = input.codemodBody
    ? beautify(input.codemodBody)
    : mainFileBoilerplate;

  let files: CodemodProjectOutput;
  if (input.engine === "ast-grep") {
    files = {
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "src/rule.yaml": mainFileContent,
    };
  } else if (input.vanillaJs) {
    files = {
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "package.json": packageJson(input),
      ".gitignore":
        "node_modules\ncdmd_dist\npnpm-lock.yaml\npackage-lock.json",
      "src/index.js": mainFileContent,
      "test/test.js": testBody(input),
      "vitest.config.js": vitestConfig(),
    };
  } else {
    files = {
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "package.json": packageJson(input),
      ".gitignore":
        "node_modules\ncdmd_dist\npnpm-lock.yaml\npackage-lock.json",
      "src/index.ts": mainFileContent,
      "test/test.ts": testBody(input),
      "vitest.config.ts": vitestConfig(),
      "tsconfig.json": tsconfigJson(),
    };
  }

  for (let i = 0; i < input.cases.length; i++) {
    // biome-ignore lint: cases[i] is defined
    const { before, after } = input.cases[i]!;

    if (input.vanillaJs) {
      (files as JavaScriptProjectFiles)[
        `__testfixtures__/fixture${i + 1}.input.js`
      ] = beautify(before);
      (files as JavaScriptProjectFiles)[
        `__testfixtures__/fixture${i + 1}.output.js`
      ] = beautify(after);
    } else {
      (files as TypeScriptProjectFiles)[
        `__testfixtures__/fixture${i + 1}.input.ts`
      ] = beautify(before);
      (files as TypeScriptProjectFiles)[
        `__testfixtures__/fixture${i + 1}.output.ts`
      ] = beautify(after);
    }
  }

  return files;
}

export const emptyJsCodeShiftBoilerplate = beautify(`
import type {
  API,
  ASTNode,
  ASTPath,
  Block,
  CommentBlock,
  CommentLine,
  FileInfo,
  Line,
  Node,
  Options,
} from "jscodeshift";

type CommentKind = Block | Line | CommentBlock | CommentLine;

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Helper function to preserve comments when replacing nodes
  function replaceWithComments(
    path: ASTPath<ASTNode & { comments?: CommentKind[] | null }>,
    newNode: Node,
  ) {
    // If the original node had comments, add them to the new node
    if (path.node.comments) {
      newNode.comments = path.node.comments;
    }

    // Replace the node
    j(path).replaceWith(newNode);
  }

  // Find all variable declarations
  root.find(j.VariableDeclarator).forEach((path) => {
    // Ensure the node is an Identifier and its name is 'toReplace'
    if (
      path.node.id.type === "Identifier" &&
      path.node.id.name === "toReplace"
    ) {
      // Create a new Identifier with the name 'replacement'
      const newId = j.identifier("replacement");

      // Replace the old Identifier with the new one, preserving comments
      replaceWithComments(path.get("id"), newId);
    }
  });

  return root.toSource();
}
`);

export const emptyFilemodBoilerplate = beautify(`
export const repomod: Filemod<Dependencies, Options> = {
	includePatterns: ["**/*.ts"],
	excludePatterns: ["**/node_modules/**"],
	handleFile: async (api, path, options) => {
		return [{ kind: "upsertFile", path }];
	},
	handleData: async (
		api,
		path,
		data,
	) => {
    if (fileName.includes("change-me.ts")) {
      return {
        kind: "upsertData",
        data: "hello world",
        path,
      };
    }

    return { kind: "noop" };
  }
}
`);

export const emptyAstGrepBoilerplate = beautify(`
# To see how to write a rule, check out the documentation at: https://ast-grep.github.io/guide/rule-config.html
id: test-ast-grep
language: bash-exp
rule:
  pattern: DATA_DIR=$A
fix: DATA_DIR="/new/path/to/resources"
`);

export const emptyTsMorphBoilerplate = beautify(`
import { type SourceFile, SyntaxKind } from "ts-morph";

function shouldProcessFile(sourceFile: SourceFile): boolean {
	return true;
}

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
	if (!shouldProcessFile(sourceFile)) {
		return undefined;
	}

	sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.filter((id) => id.getText() === "toReplace")
		.forEach((id) => {
			id.replaceWithText("replacement");
		});

	return sourceFile.getFullText();
}
`);

export const emptyWorkflowBoilerplate = beautify(`
import type { Api } from "@codemod.com/workflow";

export async function workflow({ files }: Api) {
  await files("**/*.ts")
    .jsFam()
    .astGrep("console.log($A)")
    .replace("console.error($A)");
}
`);
