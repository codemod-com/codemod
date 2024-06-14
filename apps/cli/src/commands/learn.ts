import { execSync } from "node:child_process";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import { type KnownEngines, doubleQuotify } from "@codemod-com/utilities";
import inquirer from "inquirer";
import { Project } from "ts-morph";
import { createCodeDiff } from "../apis.js";
import {
  findLastlyModifiedFile,
  findModifiedFiles,
  getGitDiffForFile,
  getLatestCommitHash,
  isFileInGitDirectory,
} from "../gitCommands.js";

// remove all special characters and whitespaces
const removeSpecialCharacters = (str: string) =>
  str.replace(/[{}()[\]:;,/?'"<>|=`!]/g, "").replace(/\s/g, "");

const isJSorTS = (name: string) =>
  name.startsWith(".ts") || name.startsWith(".js");

const getFileExtension = (filePath: string) => {
  return extname(filePath).toLowerCase();
};

const getOldSourceFile = (commitHash: string, filePath: string) => {
  try {
    const commitWithFileName = doubleQuotify(`${commitHash}:${filePath}`);
    const output = execSync(`git show ${commitWithFileName}`).toString();

    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        allowJs: true,
      },
    });

    return project.createSourceFile(filePath, output);
  } catch (error) {
    console.error(error);
    return null;
  }
};

const getSourceFile = (filePath: string) => {
  const project = new Project({
    compilerOptions: {
      allowJs: true,
    },
  });

  return project.addSourceFileAtPathIfExists(filePath) ?? null;
};

const UrlParamKeys = {
  Engine: "engine" as const,
  DiffId: "diffId" as const,
  IV: "iv" as const,
  Command: "command" as const,
};

const createCodemodStudioURL = ({
  engine,
  diffId,
  iv,
}: {
  engine: KnownEngines;
  diffId: string;
  iv: string;
}): string | null => {
  try {
    const url = new URL(process.env.CODEMOD_STUDIO_URL);
    const searchParams = new URLSearchParams([
      [UrlParamKeys.Engine, engine],
      [UrlParamKeys.DiffId, diffId],
      [UrlParamKeys.IV, iv],
      [UrlParamKeys.Command, "learn"],
    ]);

    url.search = searchParams.toString();

    return url.toString();
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const handleLearnCliCommand = async (options: {
  printer: PrinterBlueprint;
  target: string | null;
  source: string | null;
}) => {
  const { printer, target } = options;

  if (target !== null && !isFileInGitDirectory(target)) {
    printer.printOperationMessage({
      kind: "error",
      message:
        "The file on which you tried to run operation is not in a git repository.",
    });
    return;
  }

  const modifiedPaths = findModifiedFiles();

  if (modifiedPaths === null || modifiedPaths.length === 0) {
    printer.printOperationMessage({
      kind: "error",
      message: "We could not find any modified file to run the command on.",
    });
    return;
  }

  const skipped: string[] = [];
  let paths = modifiedPaths.filter((path) => {
    if (isJSorTS(getFileExtension(path))) {
      return true;
    }

    skipped.push(resolve(path));
    return false;
  });

  if (skipped.length > 0) {
    printer.printOperationMessage({
      kind: "error",
      message: chalk(
        "This feature currently only supports codemod generation using jscodeshift engine, so the files must be either a JavaScript or TypeScript file (.js, .jsx, .ts, .tsx).",
        `\nThe following files will not be processed:\n${skipped
          .map((path) => `  - ${chalk.bold(path)}`)
          .join("\n")}`,
        "\nSoon, we will support other engines and hence other extensions including .md, .mdx and more!",
      ),
    });
  }

  if (paths.length > 1) {
    const { paths: userSelectedPaths } = await inquirer.prompt<{
      paths: string[];
    }>({
      type: "checkbox",
      name: "paths",
      message: "Select the files you want to learn the diffs from",
      choices: paths.map((path) => ({
        name: path.split(sep).slice(-2).join(sep),
        value: path,
        checked: true,
      })),
    });

    paths = userSelectedPaths;
  }

  printer.printConsoleMessage(
    "info",
    chalk.cyan(
      "Learning",
      chalk.bold(doubleQuotify("git diff")),
      "has begun...",
      "\n",
    ),
  );

  const changedFiles: string[] = [];

  for (const dirtyPath of paths) {
    const latestCommitHash = getLatestCommitHash(dirname(dirtyPath));
    if (latestCommitHash === null) {
      printer.printOperationMessage({
        kind: "error",
        message:
          "Unexpected error occurred while getting the latest commit hash.",
      });

      continue;
    }

    const path = dirtyPath.replace(/\$/g, "\\$").replace(/\^/g, "\\^");

    const gitDiff = getGitDiffForFile(latestCommitHash, path);
    if (gitDiff === null) {
      printer.printOperationMessage({
        kind: "error",
        message: "Unexpected error occurred while running `git diff` command.",
      });
      return;
    }

    if (gitDiff.length === 0) {
      printer.printOperationMessage({
        kind: "error",
        message:
          "There is no difference between the status of the file and that at the previous commit.",
      });

      continue;
    }

    const hunkPattern = /^@@ -\d+(,\d+)? \+\d+(,\d+)? @@/gm;
    const hunks = [];

    let match = hunkPattern.exec(gitDiff);

    // if (path.includes("list")) {
    //   console.log(match);
    // }

    let lastIndex = 0;
    while (match !== null) {
      if (match.index !== lastIndex) {
        hunks.push(gitDiff.slice(lastIndex, match.index));
      }

      lastIndex = match.index;
      match = hunkPattern.exec(gitDiff);
      // if (path.includes("list")) {
      //   console.log(match);
      // }
    }

    if (lastIndex < gitDiff.length) {
      hunks.push(gitDiff.substring(lastIndex));
    }

    console.log(hunks);
    // return hunks;

    // function processHunk(hunk) {
    //   // Implement your logic to handle each hunk
    //   console.log("Processing hunk:\n", hunk);
    // }

    // const oldSourceFile = getOldSourceFile(latestCommitHash, path);
    // const sourceFile = getSourceFile(dirtyPath);

    // if (oldSourceFile === null || sourceFile === null) {
    //   printer.printOperationMessage({
    //     kind: "error",
    //     message: "Unexpected error occurred while getting AST of the file.",
    //   });
    //   return;
    // }

    // const beforeNodeTexts = new Set<string>();
    // const afterNodeTexts = new Set<string>();

    // const lines = gitDiff.split("\n");

    // if (path.includes("learn")) {
    //   console.log(lines);
    // }

    // for (const line of lines) {
    //   if (!line.startsWith("-") && !line.startsWith("+")) {
    //     continue;
    //   }

    //   const codeString = line.substring(1).trim();
    //   if (removeSpecialCharacters(codeString).length === 0) {
    //     continue;
    //   }

    //   if (line.startsWith("-")) {
    //     oldSourceFile.forEachChild((node) => {
    //       const content = node.getFullText();

    //       if (content.includes(codeString) && !beforeNodeTexts.has(content)) {
    //         beforeNodeTexts.add(content);
    //       }
    //     });
    //   }

    //   if (line.startsWith("+")) {
    //     sourceFile.forEachChild((node) => {
    //       const content = node.getFullText();
    //       if (content.includes(codeString) && !afterNodeTexts.has(content)) {
    //         afterNodeTexts.add(content);
    //       }
    //     });
    //   }
    // }

    // if (path.includes("learn")) {
    //   console.log(beforeNodeTexts);
    //   console.log(afterNodeTexts);
    // }

    // const irrelevantNodeTexts = new Set<string>();

    // beforeNodeTexts.forEach((text) => {
    //   if (afterNodeTexts.has(text)) {
    //     irrelevantNodeTexts.add(text);
    //   }
    // });

    // irrelevantNodeTexts.forEach((text) => {
    //   beforeNodeTexts.delete(text);
    //   afterNodeTexts.delete(text);
    // });

    // const beforeSnippet = Array.from(beforeNodeTexts)
    //   .join("")
    //   // remove all occurrences of `\n` at the beginning
    //   .replace(/^\n+/, "");
    // const afterSnippet = Array.from(afterNodeTexts)
    //   .join("")
    //   // remove all occurrences of `\n` at the beginning
    //   .replace(/^\n+/, "");

    // console.log("BEFORE", beforeSnippet);
    // console.log("AFTER", afterSnippet);
    // const { id: diffId, iv } = await createCodeDiff({
    //   beforeSnippet,
    //   afterSnippet,
    // });
    // const url = createCodemodStudioURL({
    //   // TODO: Support other engines in the future
    //   engine: "jscodeshift",
    //   diffId,
    //   iv,
    // });

    // if (url === null) {
    //   printer.printOperationMessage({
    //     kind: "error",
    //     message: "Unexpected error occurred while creating a URL.",
    //   });
    //   return;
    // }

    // printer.printConsoleMessage(
    //   "info",
    //   chalk.cyan("Learning went successful! Opening the Codemod Studio...\n"),
    // );

    // const success = openURL(url);
    // if (!success) {
    //   printer.printOperationMessage({
    //     kind: "error",
    //     message: "Unexpected error occurred while opening the Codemod Studio.",
    //   });
    //   return;
    // }
  }
};
