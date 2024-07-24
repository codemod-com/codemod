import { dirname } from "node:path";
import type { Filemod } from "@codemod-com/filemod";

export const repomod: Filemod<Record<string, never>, Record<string, never>> = {
  includePatterns: ["**/.codemodrc.json"],
  excludePatterns: ["**/node_modules/**"],
  handleFile: async (_api, path, options, state) => {
    return [{ kind: "upsertFile", path, options, state }];
  },
  handleData: async (_api, path, data) => {
    let codemodRc: { meta?: { git?: string } };
    try {
      codemodRc = JSON.parse(data);
    } catch (err) {
      return { kind: "noop" };
    }

    if (codemodRc.meta?.git) {
      return { kind: "noop" };
    }

    const rcFilePath = path.split("packages/codemods/").at(-1);
    if (typeof rcFilePath !== "string") {
      return { kind: "noop" };
    }

    codemodRc.meta = {
      ...(codemodRc.meta ?? {}),
      git: `https://github.com/codemod-com/codemod/tree/main/packages/codemods/${dirname(rcFilePath)}`,
    };

    return {
      kind: "upsertData",
      path,
      data: JSON.stringify(codemodRc, null, 2),
    };
  },
};
