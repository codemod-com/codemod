import * as colors from "colors-cli";

export const clc = {
  blueBright: (text: string) => colors.blue_bt(text),
  green: (text: string) => colors.green(text),
  red: (text: string) => colors.red(text),
  yellow: (text: string) => colors.yellow(text),
};

export const promiseTimeout = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const logger = (message: string) => {
  console.info(`${clc.blueBright("RUN ")} ${message}`);

  return {
    success: (output?: string) =>
      console.info(
        `${clc.green("SUCC")} ${message}${
          output
            ? `\n  ${output
                .split("\n")
                .map((line) => `\n    ${line}`)
                .join("")
                .trim()}`
            : ""
        }`,
      ),
    fail: (error: string) =>
      console.error(`${clc.red("ERR ")} ${message} - ${error}`),
    warn: (warning: string) =>
      console.warn(`${clc.yellow("WARN")} ${message} - ${warning}`),
  };
};
