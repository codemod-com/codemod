import inquirer from "inquirer";
import * as v from "valibot";

import { type Printer, chalk } from "@codemod-com/printer";
import {
  type ArgumentRecord,
  type Codemod,
  doubleQuotify,
  safeParseArgument,
} from "@codemod-com/utilities";

export const buildSafeArgumentRecord = async (
  codemod: Codemod,
  argvRecord: Record<string, unknown>,
  printer: Printer,
): Promise<ArgumentRecord> => {
  if (codemod.type === "standalone") {
    // no checks performed for local codemods
    // b/c no source of truth for the arguments
    return Object.entries(codemod.config.arguments).reduce<ArgumentRecord>(
      (acc, [key, value]) => {
        const maybeArgument = safeParseArgument(value);

        if (maybeArgument.success) {
          acc[key] = maybeArgument.output;
        }

        return acc;
      },
      {},
    );
  }

  const safeArgumentRecord: ArgumentRecord = {};

  let invalid: ((typeof codemod.config.arguments)[number] & { err: string })[] =
    [];
  const defaulted: string[] = [];

  const validateArg = (
    descriptor: (typeof codemod.config.arguments)[number],
    value: unknown,
  ) => {
    const validator = (
      descriptor: (typeof codemod.config.arguments)[number],
      arg: unknown,
      skipInvalidFlagging = false,
    ) => {
      const { output: stringArg, success } = v.safeParse(
        v.pipe(v.string(), v.minLength(1)),
        arg,
      );

      if (success === false) {
        if (descriptor.default !== undefined) {
          defaulted.push(descriptor.name);
          safeArgumentRecord[descriptor.name] = descriptor.default;

          return true;
        }

        if (descriptor.required) {
          if (!skipInvalidFlagging) {
            invalid.push({ ...descriptor, err: "required but missing" });
          }

          return false;
        }

        return false;
      }

      if (descriptor.kind === "enum") {
        if (
          !descriptor.options.some(
            (opt) =>
              opt === stringArg || opt === Number(arg) || opt === Boolean(arg),
          )
        ) {
          if (!skipInvalidFlagging) {
            invalid.push({
              ...descriptor,
              err: `incorrect value. Valid options: ${descriptor.options.join(
                ",",
              )}`,
            });
          }

          return false;
        }

        safeArgumentRecord[descriptor.name] = stringArg;
        return true;
      }

      if (descriptor.kind === "string") {
        safeArgumentRecord[descriptor.name] = stringArg;
        return true;
      }

      if (descriptor.kind === "boolean") {
        if (arg !== "true" && arg !== "false") {
          if (!skipInvalidFlagging) {
            invalid.push({
              ...descriptor,
              err: "incorrect value. Valid options: true, false",
            });
          }
          return false;
        }

        safeArgumentRecord[descriptor.name] = stringArg === "true";
        return true;
      }

      if (descriptor.kind === "number") {
        const numArg = Number(stringArg);
        if (!Number.isNaN(numArg) || !Number.isFinite(numArg)) {
          if (!skipInvalidFlagging) {
            invalid.push({ ...descriptor, err: "invalid number" });
          }
          return false;
        }

        safeArgumentRecord[descriptor.name] = numArg;
        return true;
      }

      return false;
    };

    if (Array.isArray(descriptor.kind)) {
      for (const kind of descriptor.kind) {
        // biome-ignore lint: weird type error that does not seem to be fixable, expected type here is different from the actual argument type
        const valid = validator({ ...descriptor, kind } as any, value, true);

        if (valid) {
          return true;
        }
      }

      invalid.push({
        ...descriptor,
        err: `incorrect type or enum value`,
      });
      return false;
    }

    return validator(descriptor, value);
  };

  codemod.config.arguments.forEach((descriptor) =>
    validateArg(descriptor, argvRecord[descriptor.name]),
  );

  if (invalid.length > 0) {
    const answers = await inquirer.prompt<ArgumentRecord>(
      invalid.map((arg) => {
        const isEnum = arg.kind === "enum";

        if (isEnum) {
          return {
            type: "list",
            name: arg.name,
            choices: arg.options,
            default: arg.options[0],
            pageSize: arg.options.length,
            message: `Please select a missing value for ${arg.name} argument`,
          };
        }

        if (Array.isArray(arg.kind)) {
          const kinds = [...arg.kind];

          const enumElIdx = kinds.indexOf("enum");
          if (enumElIdx !== -1) {
            kinds.splice(enumElIdx, 1);
          }

          let message = `Please enter a missing value for ${
            arg.name
          } argument (${kinds.join(", ")}`;

          if ("options" in arg && arg.options) {
            message += ` or one of the following: ${arg.options.join(", ")}`;
          }
          message += ")";

          return {
            type: "input",
            name: arg.name,
            message,
          };
        }

        return {
          type: "input",
          name: arg.name,
          message: `Please enter a missing value for ${arg.name} argument (${arg.kind})`,
        };
      }),
    );

    invalid = [];

    for (const [name, value] of Object.entries(answers)) {
      const descriptor = codemod.config.arguments.find(
        (arg) => arg.name === name,
      );

      if (!descriptor) {
        continue;
      }

      validateArg(descriptor, value);
    }
  }

  if (invalid.length > 0) {
    const invalidString = `- ${invalid
      .map(({ kind, name, err }) => `${doubleQuotify(name)} (${kind}) - ${err}`)
      .join("\n- ")}`;

    throw new Error(
      `Invalid arguments:\n${invalidString}\n\nMake sure provided values are correct.`,
    );
  }

  if (Object.keys(safeArgumentRecord).length > 0) {
    printer.printConsoleMessage(
      "info",
      chalk.cyan(
        "\nUsing following arguments:\n-",
        chalk.bold(
          Object.entries(safeArgumentRecord)
            .map(([key, value]) =>
              chalk(
                `${key}:`,
                value,
                defaulted.includes(key) ? chalk.grey("(default value)") : "",
              ),
            )
            .join("\n- "),
        ),
      ),
    );
  }

  return safeArgumentRecord;
};
