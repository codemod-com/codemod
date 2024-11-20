import type {
  CreateAPIKeyRequest,
  DeleteAPIKeysRequest,
} from "@codemod-com/api-types";
import type { Printer } from "@codemod-com/printer";
import { createAPIKey, deleteAPIKeys, listAPIKeys } from "#api.js";
import { getCurrentUserOrLogin } from "#auth-utils.js";

export const handleCreateAPIKeyCommand = async (options: {
  printer: Printer;
  data: CreateAPIKeyRequest;
}) => {
  const { printer } = options;

  const { token } = await getCurrentUserOrLogin({
    printer,
    message: "You need to log in to be able create API keys",
  });

  const apiKey = await createAPIKey(token, options.data);

  printer.printConsoleMessage(
    "info",
    `
${options.data.name ?? ""}
API key created successfully: ${apiKey.key}
Please store this key in a safe place, as it will not be shown again.`,
  );
};

export const handleListAPIKeysCommand = async (options: {
  printer: Printer;
}) => {
  const { printer } = options;

  const { token } = await getCurrentUserOrLogin({
    printer,
    message: "You need to log in to be able create API keys",
  });

  const { keys } = await listAPIKeys(token);

  if (keys.length === 0) {
    printer.printConsoleMessage("info", "No API keys found");
    return;
  }

  printer.printConsoleMessage(
    "info",
    `
API keys:
${keys.map(({ name, start, createdAt, expiresAt }) => `  - ${[name, `${start}...`, `created at ${new Date(createdAt).toISOString()}`, expiresAt ? `expires at ${new Date(expiresAt).toISOString()}` : undefined].filter((info) => !!info).join("\n      ")}`).join("\n")}
`,
  );
};

export const handleDeleteAPIKeysCommand = async (options: {
  printer: Printer;
  data: DeleteAPIKeysRequest;
}) => {
  const { printer, data } = options;

  const { token } = await getCurrentUserOrLogin({
    printer,
    message: "You need to log in to be able create API keys",
  });

  const { keys } = await deleteAPIKeys(token, data);

  if (keys.length === 0) {
    printer.printConsoleMessage("info", "No API keys were deleted");
    return;
  }

  printer.printConsoleMessage(
    "info",
    `
Next API keys were deleted:
${keys.map(({ name, start }) => `  - ${[name, `${start}...`].filter((info) => !!info).join("\n      ")}`).join("\n")}
`,
  );
};
