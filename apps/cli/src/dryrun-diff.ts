import { basename } from "node:path";
import { boxen, chalk } from "@codemod-com/printer";
import blessed from "blessed";
import * as diff from "diff";
import type { NamedFileCommand } from "./types/commands.js";

interface DiffResult {
  filename: string;
  codemodName: string;
  diff: string;
}

export const getDiff = (command: NamedFileCommand): DiffResult => {
  if (command.kind === "createFile") {
    return {
      filename: command.newPath,
      codemodName: command.codemodName,
      diff: chalk.bgGreen(command.newData),
    };
  }

  if (command.kind === "deleteFile") {
    return {
      filename: command.oldPath,
      codemodName: command.codemodName,
      diff: "",
    };
  }

  if (command.kind === "moveFile") {
    return {
      filename: `${command.oldPath} -> ${command.newPath}`,
      codemodName: command.codemodName,
      diff: "",
    };
  }

  if (command.kind === "copyFile") {
    return {
      filename: `COPIED: ${command.oldPath} -> ${command.newPath}`,
      codemodName: command.codemodName,
      diff: "",
    };
  }

  const diffResult = diff.diffWords(command.oldData, command.newData);

  const formattedDiff = diffResult
    .map((part) => {
      const color = part.added ? "green" : part.removed ? "red" : "grey";

      return chalk[color](part.value);
      // return part.value
      //   .split("\n")
      //   .map((line) => chalk[color](line))
      //   .join("\n");
    })
    .join("");

  return {
    filename: `${command.oldPath}`,
    codemodName: command.codemodName,
    diff: formattedDiff,
  };
};

export const getDiffScreen = (diffs: DiffResult[]): blessed.Widgets.Screen => {
  if (diffs.length === 0) {
    throw new Error("No diffs to display");
  }

  const screen = blessed.screen({
    smartCSR: true,
    title: "Diff Viewer",
  });

  const diffContent = diffs
    .map(
      (diff) =>
        `${boxen(`@@ ${basename(diff.filename)} (${diff.codemodName})`, { padding: 0.5 })}\n${diff.diff}`,
    )
    .join("\n\n");

  const diffBox = blessed.box({
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    content: diffContent,
    tags: true,
    scrollable: true,
    alwaysScroll: true,
    keys: true,
    vi: true,
    mouse: true,
    border: {
      type: "line",
    },
    style: {
      border: {
        fg: "#f0f0f0",
      },
    },
  });

  screen.append(diffBox);

  diffBox.focus();

  return screen;
};
