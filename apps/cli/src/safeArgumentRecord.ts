import { type PrinterBlueprint, chalk } from "@codemod-com/printer";
import type { Codemod } from "@codemod-com/runner";
import {
  type Argument,
  type ArgumentRecord,
  doubleQuotify,
  safeParseArgument,
} from "@codemod-com/utilities";
import inquirer from "inquirer";

export const buildSafeArgumentRecord = async (
  codemod: Codemod,
  rawArgumentRecord: Record<string, unknown>,
  printer: PrinterBlueprint,
): Promise<ArgumentRecord> => {
  if (codemod.source === "standalone") {
    // no checks performed for local codemods
    // b/c no source of truth for the arguments
    return Object.entries(rawArgumentRecord).reduce<ArgumentRecord>(
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

  let invalid: ((typeof codemod.arguments)[number] & { err: string })[] = [];
  const defaulted: string[] = [];

  const validateArg = (
    descriptor: (typeof codemod.arguments)[number],
    value: unknown,
  ) => {
    const validator = (
      descriptor: (typeof codemod.arguments)[number],
      arg: unknown,
      skipInvalidFlagging = false,
    ) => {
      const maybeArgument = safeParseArgument(arg);

      if (
        !maybeArgument.success &&
        descriptor.required &&
        descriptor.default === undefined
      ) {
        if (!skipInvalidFlagging) {
          invalid.push({ ...descriptor, err: "required but missing" });
        }
        return false;
      }

      if (maybeArgument.success && descriptor.kind === "enum") {
        if (!descriptor.options.includes(maybeArgument.output)) {
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

        safeArgumentRecord[descriptor.name] = maybeArgument.output;
        return true;
      }

      if (maybeArgument.success && descriptor.kind === "boolean") {
        if (
          maybeArgument.output === "true" ||
          maybeArgument.output === "false"
        ) {
          if (!skipInvalidFlagging) {
            invalid.push({
              ...descriptor,
              err: "incorrect value. Valid options: true, false",
            });
          }

          return false;
        }

        safeArgumentRecord[descriptor.name] = maybeArgument.output === "true";
        return true;
      }

      if (maybeArgument.success && descriptor.kind === "number") {
        const numArg = Number(maybeArgument.output);
        if (Number.isNaN(numArg) || !Number.isFinite(numArg)) {
          if (!skipInvalidFlagging) {
            invalid.push({ ...descriptor, err: "invalid number" });
          }

          return false;
        }

        safeArgumentRecord[descriptor.name] = numArg;
        return true;
      }

      if (
        maybeArgument.success &&
        descriptor.kind === "string" &&
        typeof maybeArgument.output === "string"
      ) {
        if (maybeArgument.output.length === 0) {
          if (!skipInvalidFlagging) {
            invalid.push({ ...descriptor, err: "empty string" });
          }

          return false;
        }

        safeArgumentRecord[descriptor.name] = maybeArgument.output;
        return true;
      }

      if (
        maybeArgument.success &&
        // biome-ignore lint: incorrect warning
        typeof maybeArgument.output === descriptor.kind
      ) {
        safeArgumentRecord[descriptor.name] = maybeArgument.output;
      } else if (descriptor.default !== undefined) {
        defaulted.push(descriptor.name);
        safeArgumentRecord[descriptor.name] = descriptor.default;
      }

      return true;
    };

    if (Array.isArray(descriptor.kind)) {
      for (const kind of descriptor.kind) {
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

  codemod.arguments.forEach((descriptor) =>
    validateArg(descriptor, rawArgumentRecord[descriptor.name]),
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

          if ("options" in arg) {
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
      const descriptor = codemod.arguments.find((arg) => arg.name === name);

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
