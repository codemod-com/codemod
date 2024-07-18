import { format } from "node:util";

import { type ConsoleKind, parseConsoleKind } from "@codemod-com/printer";

export const buildVmConsole =
  (callback: (kind: ConsoleKind, message: string) => void) =>
  (k: unknown, data: unknown, ...args: unknown[]) => {
    const kind = parseConsoleKind(k);

    const message = format(data, ...args);

    callback(kind, message);
  };
