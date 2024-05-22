import * as changeCase from "change-case";
import jsBeautify from "js-beautify";
import type { KnownEngines } from "./schemata/codemodConfigSchema.js";

const { js } = jsBeautify;
export interface ProjectDownloadInput {
  codemodBody?: string;
  name: string;
  engine: KnownEngines | "tsmorph";

  license?: "MIT" | "Apache 2.0";
  vanillaJs?: boolean;
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
  LICENSE: string;
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
export type AstGrepProjectFiles = {
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

const readme = ({ name, cases, vanillaJs }: ProjectDownloadInput) => {
  return `# ${changeCase.sentenceCase(name)}

## Description

## Examples
${cases?.map(({ before, after }) => {
  return `
### Before

\`\`\`${vanillaJs ? "js" : "ts"}
${beautify(before)}
\`\`\`

### After

\`\`\`${vanillaJs ? "js" : "ts"}
${beautify(after)}
\`\`\`
`;
})}
`;
};

const license = ({
  username,
  license,
}: Pick<ProjectDownloadInput, "username" | "license">) => {
  const MIT = `The MIT License (MIT)

Copyright (c) 2024${username ? ` ${username}` : ""}

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
`;

  const APACHE = `                                 Apache License
                           Version 2.0, January 2004
                        http://www.apache.org/licenses/

   TERMS AND CONDITIONS FOR USE, REPRODUCTION, AND DISTRIBUTION

   1. Definitions.

      "License" shall mean the terms and conditions for use, reproduction,
      and distribution as defined by Sections 1 through 9 of this document.

      "Licensor" shall mean the copyright owner or entity authorized by
      the copyright owner that is granting the License.

      "Legal Entity" shall mean the union of the acting entity and all
      other entities that control, are controlled by, or are under common
      control with that entity. For the purposes of this definition,
      "control" means (i) the power, direct or indirect, to cause the
      direction or management of such entity, whether by contract or
      otherwise, or (ii) ownership of fifty percent (50%) or more of the
      outstanding shares, or (iii) beneficial ownership of such entity.

      "You" (or "Your") shall mean an individual or Legal Entity
      exercising permissions granted by this License.

      "Source" form shall mean the preferred form for making modifications,
      including but not limited to software source code, documentation
      source, and configuration files.

      "Object" form shall mean any form resulting from mechanical
      transformation or translation of a Source form, including but
      not limited to compiled object code, generated documentation,
      and conversions to other media types.

      "Work" shall mean the work of authorship, whether in Source or
      Object form, made available under the License, as indicated by a
      copyright notice that is included in or attached to the work
      (an example is provided in the Appendix below).

      "Derivative Works" shall mean any work, whether in Source or Object
      form, that is based on (or derived from) the Work and for which the
      editorial revisions, annotations, elaborations, or other modifications
      represent, as a whole, an original work of authorship. For the purposes
      of this License, Derivative Works shall not include works that remain
      separable from, or merely link (or bind by name) to the interfaces of,
      the Work and Derivative Works thereof.

      "Contribution" shall mean any work of authorship, including
      the original version of the Work and any modifications or additions
      to that Work or Derivative Works thereof, that is intentionally
      submitted to Licensor for inclusion in the Work by the copyright owner
      or by an individual or Legal Entity authorized to submit on behalf of
      the copyright owner. For the purposes of this definition, "submitted"
      means any form of electronic, verbal, or written communication sent
      to the Licensor or its representatives, including but not limited to
      communication on electronic mailing lists, source code control systems,
      and issue tracking systems that are managed by, or on behalf of, the
      Licensor for the purpose of discussing and improving the Work, but
      excluding communication that is conspicuously marked or otherwise
      designated in writing by the copyright owner as "Not a Contribution."

      "Contributor" shall mean Licensor and any individual or Legal Entity
      on behalf of whom a Contribution has been received by Licensor and
      subsequently incorporated within the Work.

   2. Grant of Copyright License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      copyright license to reproduce, prepare Derivative Works of,
      publicly display, publicly perform, sublicense, and distribute the
      Work and such Derivative Works in Source or Object form.

   3. Grant of Patent License. Subject to the terms and conditions of
      this License, each Contributor hereby grants to You a perpetual,
      worldwide, non-exclusive, no-charge, royalty-free, irrevocable
      (except as stated in this section) patent license to make, have made,
      use, offer to sell, sell, import, and otherwise transfer the Work,
      where such license applies only to those patent claims licensable
      by such Contributor that are necessarily infringed by their
      Contribution(s) alone or by combination of their Contribution(s)
      with the Work to which such Contribution(s) was submitted. If You
      institute patent litigation against any entity (including a
      cross-claim or counterclaim in a lawsuit) alleging that the Work
      or a Contribution incorporated within the Work constitutes direct
      or contributory patent infringement, then any patent licenses
      granted to You under this License for that Work shall terminate
      as of the date such litigation is filed.

   4. Redistribution. You may reproduce and distribute copies of the
      Work or Derivative Works thereof in any medium, with or without
      modifications, and in Source or Object form, provided that You
      meet the following conditions:

      (a) You must give any other recipients of the Work or
          Derivative Works a copy of this License; and

      (b) You must cause any modified files to carry prominent notices
          stating that You changed the files; and

      (c) You must retain, in the Source form of any Derivative Works
          that You distribute, all copyright, patent, trademark, and
          attribution notices from the Source form of the Work,
          excluding those notices that do not pertain to any part of
          the Derivative Works; and

      (d) If the Work includes a "NOTICE" text file as part of its
          distribution, then any Derivative Works that You distribute must
          include a readable copy of the attribution notices contained
          within such NOTICE file, excluding those notices that do not
          pertain to any part of the Derivative Works, in at least one
          of the following places: within a NOTICE text file distributed
          as part of the Derivative Works; within the Source form or
          documentation, if provided along with the Derivative Works; or,
          within a display generated by the Derivative Works, if and
          wherever such third-party notices normally appear. The contents
          of the NOTICE file are for informational purposes only and
          do not modify the License. You may add Your own attribution
          notices within Derivative Works that You distribute, alongside
          or as an addendum to the NOTICE text from the Work, provided
          that such additional attribution notices cannot be construed
          as modifying the License.

      You may add Your own copyright statement to Your modifications and
      may provide additional or different license terms and conditions
      for use, reproduction, or distribution of Your modifications, or
      for any such Derivative Works as a whole, provided Your use,
      reproduction, and distribution of the Work otherwise complies with
      the conditions stated in this License.

   5. Submission of Contributions. Unless You explicitly state otherwise,
      any Contribution intentionally submitted for inclusion in the Work
      by You to the Licensor shall be under the terms and conditions of
      this License, without any additional terms or conditions.
      Notwithstanding the above, nothing herein shall supersede or modify
      the terms of any separate license agreement you may have executed
      with Licensor regarding such Contributions.

   6. Trademarks. This License does not grant permission to use the trade
      names, trademarks, service marks, or product names of the Licensor,
      except as required for reasonable and customary use in describing the
      origin of the Work and reproducing the content of the NOTICE file.

   7. Disclaimer of Warranty. Unless required by applicable law or
      agreed to in writing, Licensor provides the Work (and each
      Contributor provides its Contributions) on an "AS IS" BASIS,
      WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or
      implied, including, without limitation, any warranties or conditions
      of TITLE, NON-INFRINGEMENT, MERCHANTABILITY, or FITNESS FOR A
      PARTICULAR PURPOSE. You are solely responsible for determining the
      appropriateness of using or redistributing the Work and assume any
      risks associated with Your exercise of permissions under this License.

   8. Limitation of Liability. In no event and under no legal theory,
      whether in tort (including negligence), contract, or otherwise,
      unless required by applicable law (such as deliberate and grossly
      negligent acts) or agreed to in writing, shall any Contributor be
      liable to You for damages, including any direct, indirect, special,
      incidental, or consequential damages of any character arising as a
      result of this License or out of the use or inability to use the
      Work (including but not limited to damages for loss of goodwill,
      work stoppage, computer failure or malfunction, or any and all
      other commercial damages or losses), even if such Contributor
      has been advised of the possibility of such damages.

   9. Accepting Warranty or Additional Liability. While redistributing
      the Work or Derivative Works thereof, You may choose to offer,
      and charge a fee for, acceptance of support, warranty, indemnity,
      or other liability obligations and/or rights consistent with this
      License. However, in accepting such obligations, You may act only
      on Your own behalf and on Your sole responsibility, not on behalf
      of any other Contributor, and only if You agree to indemnify,
      defend, and hold each Contributor harmless for any liability
      incurred by, or claims asserted against, such Contributor by reason
      of your accepting any such warranty or additional liability.

   END OF TERMS AND CONDITIONS

   APPENDIX: How to apply the Apache License to your work.

      To apply the Apache License to your work, attach the following
      boilerplate notice, with the fields enclosed by brackets "[]"
      replaced with your own identifying information. (Don't include
      the brackets!)  The text should be enclosed in the appropriate
      comment syntax for the file format. We also recommend that a
      file or class name and description of purpose be included on the
      same "printed page" as the copyright notice for easier
      identification within third-party archives.

   Copyright 2024${username ? ` ${username}` : ""}

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
`;

  if (license === "Apache 2.0") {
    return APACHE;
  }

  return MIT;
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
}: Pick<ProjectDownloadInput, "name" | "engine" | "tags" | "version">) => {
  const finalName = changeCase.kebabCase(name);

  return beautify(`
    {
      "$schema": "https://codemod-utils.s3.us-west-1.amazonaws.com/configuration_schema.json",
      "version": "${version ?? "1.0.0"}",
      "private": false,
      "name": "${finalName}",
      "engine": "${engine}",
      "meta": {
        "tags": ${tags?.length ? JSON.stringify(tags) : "[]"}
      }
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
  name,
  engine,
  username,
}: Pick<ProjectDownloadInput, "name" | "engine" | "username">) => {
  const finalName = changeCase.kebabCase(name);

  let packages = "";
  if (engine === "jscodeshift") {
    packages = `
	    "jscodeshift": "^0.15.1",
      "@types/jscodeshift": "^0.11.10"
    `;
  } else if (engine === "ts-morph" || engine === "tsmorph") {
    packages = `
      "ts-morph": "^20.0.0"
    `;
  } else if (engine === "filemod") {
    packages = `
      "@codemod-com/filemod": "^2.0.0"
    `;
  } else if (engine === "workflow") {
    packages = `
      "@codemodcom/workflow": "^0.0.1"
    `;
  }

  return beautify(`
      {
        "name": "${finalName}",
        "author": "${username ?? ""}",
        "dependencies": {},
        "devDependencies": {
          "@types/node": "20.9.0",
          "typescript": "5.2.2",
          "vitest": "^1.0.1",
          ${packages.trim()}
        },
        "scripts": {
          "test": "vitest run",
          "test:watch": "vitest watch"
        },
        "license": "MIT",
        "files": [
          "README.md",
          ".codemodrc.json",
          "./dist/index.cjs"
        ],
        "type": "module"
      }
  `);
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
          ${cases?.map((_, i) => {
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

  if (!input.cases || input.cases.length === 0) {
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
      LICENSE: license(input),
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "src/rule.yaml": mainFileContent,
    };
  } else if (input.vanillaJs) {
    files = {
      LICENSE: license(input),
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "package.json": packageJson(input),
      ".gitignore": "node_modules\ndist",
      "src/index.js": mainFileContent,
      "test/test.js": testBody(input),
      "vitest.config.js": vitestConfig(),
    };
  } else {
    files = {
      LICENSE: license(input),
      "README.md": readme(input),
      ".codemodrc.json": codemodRc(input),
      "package.json": packageJson(input),
      ".gitignore": "node_modules\ndist",
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
// BUILT WITH https://codemod.studio

import type { FileInfo, API, Options } from "jscodeshift";
export default function transform(
  file: FileInfo,
  api: API,
  options?: Options
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Helper function to preserve comments when replacing nodes
  function replaceWithComments(path, newNode) {
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
import type { Api } from "@codemodcom/workflow";

export async function workflow({ jsFiles }: Api) {
  await jsFiles("**/*.ts")
    .astGrep("console.log($A)")
    .replace("console.error($A)");
}
`);
