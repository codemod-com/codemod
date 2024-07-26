import * as os from "node:os";
import { join } from "node:path";

import { chalk } from "@codemod-com/printer";

export const codemodDirectoryPath = join(os.homedir(), ".codemod");
export const oraCheckmark = chalk.green("✔");
export const oraCross = chalk.red("✖");
