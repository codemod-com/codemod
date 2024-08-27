import prettyjson from "prettyjson";
import * as v from "valibot";

import type { Printer } from "@codemod-com/printer";
import type { ArgumentRecord, Codemod } from "@codemod-com/utilities";

export const buildSafeArgumentRecord = async (
  codemod: Codemod,
  argvRecord: Record<string, unknown>,
  printer: Printer,
): Promise<ArgumentRecord> => {
  if (codemod.type === "standalone") {
    // no checks performed for local codemods
    // b/c no source of truth for the arguments
    const { ...safeRecord } = argvRecord;
    delete safeRecord._;
    delete safeRecord.include;
    delete safeRecord.exclude;
    return safeRecord as ArgumentRecord;
  }

  const validateStringArg = (options: {
    name: string;
    value: unknown;
    kind: "string" | "number" | "boolean";
  }) => {
    const { kind, name, value } = options;

    if (kind === "boolean") {
      return v.parse(
        v.pipe(
          v.custom((input) => input === "true" || input === "false"),
          v.transform((input) => input === "true"),
          v.boolean(),
        ),
        value,
        {
          message: `${name} should be boolean. Possible values: true|false.`,
        },
      );
    }

    if (kind === "number") {
      return v.parse(v.number(), Number(value), {
        message: `Error parsing ${name} as number`,
      });
    }

    if (kind === "string") {
      return v.parse(
        v.pipe(
          v.string(),
          v.minLength(1, `Empty values are not allowed (${name})`),
        ),
        value,
        { message: `Error parsing ${name} as string` },
      );
    }

    throw new Error(`Unknown kind: ${kind}`);
  };

  const errors: { name: string; error: Error }[] = [];
  return codemod.config.arguments.reduce((acc, arg) => {
    try {
      const argvValue = argvRecord[arg.name];

      if (arg.required && argvValue === undefined) {
        throw new Error(`Missing required argument: ${arg.name}`);
      }

      if (arg.kind === "enum") {
        const atLeastOneMatches = arg.options.some((option) => {
          try {
            acc[arg.name] = validateStringArg({
              name: arg.name,
              value: argvValue,
              kind: String(typeof option) as "string" | "number" | "boolean",
            });
            return acc[arg.name] === option;
          } catch {}

          return false;
        });

        if (!atLeastOneMatches) {
          throw new Error(
            `Invalid value for ${arg.name}. Possible values: ${arg.options.join(
              ", ",
            )}`,
          );
        }

        return acc;
      }

      if (Array.isArray(arg.kind)) {
        for (const kind of arg.kind) {
          if (kind === "enum") {
            continue;
          }

          acc[arg.name] = validateStringArg({
            name: arg.name,
            value: argvValue,
            kind,
          });
        }

        return acc;
      }

      acc[arg.name] = validateStringArg({
        name: arg.name,
        value: argvValue,
        kind: arg.kind,
      });
    } catch (err) {
      if (!(err instanceof Error)) {
        throw err;
      }

      if (arg.default !== undefined) {
        acc[arg.name] = arg.default;
        return acc;
      }

      if (!arg.required) {
        errors.push({ name: arg.name, error: err });
        return acc;
      }

      printer.printConsoleMessage("error", `\n${err.message}`);
      printer.printConsoleMessage(
        "log",
        `\n${prettyjson.render(arg, { inlineArrays: true })}`,
      );

      process.exit(1);
    }

    return acc;
  }, {} as ArgumentRecord);
};
