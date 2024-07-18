import { constants, access } from "node:fs/promises";
import { join } from "node:path";

import { type FileCommand, execPromise } from "@codemod-com/utilities";

const javaScriptPatterns = ["**/*.js", "**/*.jsx", "**/*.cjs", "**/*.mjs"];
const typeScriptPatterns = ["**/*.ts", "**/*.cts", "**/*.mts"];
const tsxPatterns = ["**/*.tsx"];
const pythonPatterns = ["**/*.py", "**/*.py3", "**/*.pyi", "**/*.bzl"];
const javaPatterns = ["**/*.java"];
const bashPatterns = [
  "**/*.bash",
  "**/*.bats",
  "**/*.cgi",
  "**/*.command",
  "**/*.env",
  "**/*.fcgi",
  "**/*.ksh",
  "**/*.sh",
  "**/*.sh.in",
  "**/*.tmux",
  "**/*.tool",
  "**/*.zsh",
];
const cPatterns = ["**/*.c", "**/*.h"];
const cppPatterns = [
  "**/*.cc",
  "**/*.hpp",
  "**/*.cpp",
  "**/*.c++",
  "**/*.hh",
  "**/*.cxx",
  "**/*.cu",
  "**/*.ino",
];
const jsonPatterns = ["**/*.json"];
const htmlPatterns = ["**/*.html", "**/*.htm", "**/*.xhtml"];
export const astGrepLanguageToPatterns: Record<string, string[]> = {
  js: javaScriptPatterns,
  jsx: javaScriptPatterns,
  javascript: javaScriptPatterns,

  ts: typeScriptPatterns,
  typescript: typeScriptPatterns,

  tsx: tsxPatterns,

  py: pythonPatterns,
  python: pythonPatterns,

  java: javaPatterns,

  "bash-exp": bashPatterns,

  c: cPatterns,

  cc: cppPatterns,
  "c++": cppPatterns,
  cpp: cppPatterns,
  cxx: cppPatterns,

  json: jsonPatterns,

  html: htmlPatterns,
};

type AstGrepCompactOutput = {
  text: string;
  range: {
    byteOffset: { start: number; end: number };
    start: { line: number; column: number };
    end: { line: number; column: number };
  };
  file: string;
  lines: string;
  replacement?: string;
  replacementOffsets?: { start: number; end: number };
  language: string;
  ruleId: string;
  severity: string;
  note: string | null;
  message: string;
};

export const runAstGrepCodemod = async (
  rulesPath: string,
  oldPath: string,
  oldData: string,
  formatWithPrettier: boolean,
): Promise<readonly FileCommand[]> => {
  let astGrepExecutablePath: string;

  try {
    // Try to look by the package.json of the CLI
    astGrepExecutablePath = join(
      require.resolve("@ast-grep/cli/package.json"),
      "..",
      "sg",
    );
    await access(astGrepExecutablePath, constants.X_OK);
  } catch (err) {
    try {
      // If not, then try to get node_modules path and then look for .bin folder
      astGrepExecutablePath = join(
        __dirname,
        "..",
        "node_modules",
        ".bin",
        "sg",
      );
      await access(astGrepExecutablePath, constants.X_OK);
    } catch (err) {
      // Finally, try to install it globally
      // First, use `which` command to check if the CLI is already installed
      try {
        await execPromise("which sg");
        astGrepExecutablePath = "sg";
      } catch (err) {
        // If not installed, try to install using npm globally
        try {
          const astInstallCommand = "npm install -g @ast-grep/cli";
          if (process.platform === "win32") {
            await execPromise(`powershell -Command ${astInstallCommand}`);
          } else {
            await execPromise(astInstallCommand);
          }
          astGrepExecutablePath = "sg";
        } catch (err) {
          throw new Error(
            `Could not locate the ast-grep CLI. Please install it with 'npm install -g @ast-grep/cli'.`,
          );
        }
      }
    }
  }

  const commands: FileCommand[] = [];

  const rulesPathEscaped = rulesPath.replace(/(\s+)/g, "\\$1");
  const oldPathEscaped = oldPath.replace(/(\s+)/g, "\\$1");

  const astCommandBase = `${astGrepExecutablePath} scan --rule ${rulesPathEscaped} ${oldPathEscaped} --json=compact`;

  const astCommand =
    process.platform === "win32"
      ? `powershell -Command "${astCommandBase}"`
      : astCommandBase;

  const { stdout } = await execPromise(astCommand);
  const matches = JSON.parse(stdout.trim()) as AstGrepCompactOutput[];
  // Sort in reverse order to not mess up replacement offsets
  matches.sort((a, b) => b.range.byteOffset.start - a.range.byteOffset.start);

  let newData = oldData;
  for (const result of matches) {
    const { replacementOffsets, replacement } = result;
    if (!replacementOffsets) {
      continue;
    }

    newData =
      newData.slice(0, replacementOffsets.start) +
      replacement +
      newData.slice(replacementOffsets.end);
  }

  if (typeof newData !== "string" || oldData === newData) {
    return commands;
  }

  commands.push({
    kind: "updateFile",
    oldPath,
    oldData,
    newData,
    formatWithPrettier,
  });

  return commands;
};
