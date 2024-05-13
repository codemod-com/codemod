import type { Codemod } from "@codemod-com/runner";
import {
  type Argument,
  type ArgumentRecord,
  doubleQuotify,
  safeParseArgument,
} from "@codemod-com/utilities";

export const buildSafeArgumentRecord = (
  codemod: Codemod,
  rawArgumentRecord: Record<string, unknown>,
): ArgumentRecord => {
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

  const invalid: ((typeof codemod.arguments)[number] & { err: string })[] = [];

  const validateArg = (
    descriptor: (typeof codemod.arguments)[number],
    arg: unknown,
  ) => {
    const maybeArgument = safeParseArgument(arg);

    if (
      !maybeArgument.success &&
      descriptor.required &&
      descriptor.default === undefined
    ) {
      invalid.push({ ...descriptor, err: "required but missing" });
      return false;
    }

    if (!maybeArgument.success) {
      return false;
    }

    if (descriptor.kind === "enum") {
      if (!descriptor.options.includes(maybeArgument.output)) {
        invalid.push({
          ...descriptor,
          err: `incorrect value. Valid options: ${descriptor.options.join(
            ",",
          )}`,
        });
      } else {
        safeArgumentRecord[descriptor.name] = maybeArgument.output;
      }

      return true;
    }

    if (
      // biome-ignore lint: incorrect warning
      typeof maybeArgument.output === descriptor.kind
    ) {
      safeArgumentRecord[descriptor.name] = maybeArgument.output;
    } else if (descriptor.default !== undefined) {
      safeArgumentRecord[descriptor.name] = descriptor.default;
    }

    return true;
  };

  codemod.arguments.forEach((descriptor) => {
    if (Array.isArray(descriptor.kind)) {
      let isValid = false;

      for (const kind of descriptor.kind) {
        const valid = validateArg(
          { ...descriptor, kind } as any,
          rawArgumentRecord[descriptor.name],
        );

        if (valid) {
          isValid = true;
          break;
        }
      }

      return;
    }

    return validateArg(descriptor, rawArgumentRecord[descriptor.name]);
  });

  if (invalid.length > 0) {
    const missingString = `- ${invalid
      .map(({ kind, name, err }) => `${doubleQuotify(name)} (${kind}) - ${err}`)
      .join("\n- ")}`;

    throw new Error(
      `Invalid arguments:\n${missingString}\n\nPlease provide missing values as "--<arg-name> <value>" or make sure the provided values are valid.`,
    );
  }

  return safeArgumentRecord;
};
