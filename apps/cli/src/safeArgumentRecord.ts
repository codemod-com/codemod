import type { Codemod } from "@codemod-com/runner";
import { type ArgumentRecord, doubleQuotify } from "@codemod-com/utilities";
import { safeParseArgument } from "@codemod-com/utilities/dist/schemata/argumentRecordSchema";

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
      maybeArgument.success &&
      typeof maybeArgument.output === descriptor.kind
    ) {
      safeArgumentRecord[descriptor.name] = maybeArgument.output;
    } else if (descriptor.default !== undefined) {
      safeArgumentRecord[descriptor.name] = descriptor.default;
    }
  });

  if (missing.length > 0) {
    const missingString = `- ${missing
      .map(({ kind, name }) => `${doubleQuotify(name)} (${kind})`)
      .join("\n- ")}`;
    throw new Error(
      `Missing required arguments:\n\n${missingString}\n\nPlease provide them as "--<arg-name> <value>".`,
    );
  }

  return safeArgumentRecord;
};
