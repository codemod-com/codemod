import type { Codemod } from "@codemod-com/runner";
import {
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

  const missing: typeof codemod.arguments = [];
  const invalid: typeof codemod.arguments = [];
  codemod.arguments.forEach((descriptor) => {
    const maybeArgument = safeParseArgument(rawArgumentRecord[descriptor.name]);

    if (
      !maybeArgument.success &&
      descriptor.required &&
      descriptor.default === undefined
    ) {
      missing.push(descriptor);
    }

    if (
      descriptor.kind === "enum" &&
      maybeArgument.success &&
      !descriptor.options.includes(maybeArgument.output)
    ) {
      invalid.push(descriptor);
    }

    if (
      maybeArgument.success &&
      typeof maybeArgument.output === descriptor.kind
    ) {
      safeArgumentRecord[descriptor.name] = maybeArgument.output;
    } else if (descriptor.default !== undefined) {
      safeArgumentRecord[descriptor.name] = descriptor.default;
    }
  });

  let errMsg = "";
  if (missing.length > 0) {
    const missingString = `- ${missing
      .map(({ kind, name }) => `${doubleQuotify(name)} (${kind})`)
      .join("\n- ")}`;
    errMsg += `Missing required arguments:\n${missingString}\nPlease provide them as "--<arg-name> <value>".`;
  }

  if (invalid.length > 0) {
    const invalidString = `- ${invalid
      .map(({ kind, name }) => `${doubleQuotify(name)} (${kind})`)
      .join("\n- ")}`;
    if (errMsg.length > 0) {
      errMsg += "\n\n";
    }
    errMsg += `Invalid arguments:\n${invalidString}\nPlease use one of the predefined values.`;
  }

  if (errMsg.length > 0) {
    throw new Error(errMsg);
  }

  return safeArgumentRecord;
};
