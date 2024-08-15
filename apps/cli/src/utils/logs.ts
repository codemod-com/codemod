import * as fs from "node:fs";
import * as os from "node:os";
import { join } from "node:path";

import { chalk } from "@codemod-com/printer";
import { doubleQuotify } from "@codemod-com/utilities";
import { version } from "#/../package.json";
import { codemodDirectoryPath } from "./constants.js";

export const logsPath = join(codemodDirectoryPath, "logs");

export const writeLogs = async (options: {
  prefix: string;
  content: string;
  fatal?: boolean;
}): Promise<string> => {
  const { prefix, content, fatal } = options;

  const logFilePath = join(
    logsPath,
    `${fatal ? "FATAL-" : ""}${new Date().toISOString()}-error.log`,
  );

  const logsContent = `- CLI version: ${version}
- Node version: ${process.versions.node}
- OS: ${os.type()} ${os.release()} ${os.arch()}

${content}
`;

  try {
    await fs.promises.mkdir(logsPath, { recursive: true });
    await fs.promises.writeFile(logFilePath, logsContent);

    return chalk.cyan(
      prefix ? `\n${prefix}` : "",
      `\nLogs can be found at:`,
      chalk.bold(logFilePath),
      "\nFor feedback or reporting issues, run",
      chalk.bold(doubleQuotify("codemod feedback")),
      "and include the logs.",
    );
  } catch (err) {
    return `Failed to write error log file at ${logFilePath}. Please verify that codemod CLI has the necessary permissions to write to this location.`;
  }
};
