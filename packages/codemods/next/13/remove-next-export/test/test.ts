import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import { Volume, createFsFromVolume } from "memfs";
import tsmorph from "ts-morph";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const PACKAGE_JSON = JSON.stringify({
  scripts: {
    a: "b",
    export: "rimraf a && next export --threads=3 -o export && yarn a",
  },
});

const NEXT_CONFIG_JSON = `
module.exports = {
	distDir: 'out',
}`;

const SCRIPT_SH_A = `
node_modules/.bin/next build
node_modules/.bin/next export
`;

const SCRIPT_SH_B = `
npm run next build
npm run next export
`;

const SCRIPT_SH_C = `
npx next export
`;

const README_MD = `
# Header
next export -o public
`;

const transform = async () => {
  const volume = Volume.fromJSON({
    "/opt/project/package.json": PACKAGE_JSON,
    "/opt/project/pages/script_a.sh": SCRIPT_SH_A,
    "/opt/project/pages/script_b.sh": SCRIPT_SH_B,
    "/opt/project/pages/script_c.sh": SCRIPT_SH_C,
    "/opt/project/pages/README.md": README_MD,
    "/opt/project/pages/README.notmd": README_MD,
    "/opt/project/pages/next.config.js": NEXT_CONFIG_JSON,
  });

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{
    tsmorph: typeof tsmorph;
  }>(
    unifiedFileSystem,
    () => ({
      tsmorph,
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", {}, {});
};

describe("next 13 remove-next-export", () => {
  it("should build correct files", async () => {
    const externalFileCommands = await transform();

    deepStrictEqual(externalFileCommands, [
      {
        kind: "upsertFile",
        path: "/opt/project/package.json",
        oldData: PACKAGE_JSON,
        newData: '{"scripts":{"a":"b"}}',
      },
      {
        kind: "upsertFile",
        path: "/opt/project/pages/script_c.sh",
        oldData: SCRIPT_SH_C,
        newData: "\n",
      },
      {
        kind: "upsertFile",
        path: "/opt/project/pages/script_b.sh",
        oldData: SCRIPT_SH_B,
        newData: "\nnpm run next build\n",
      },
      {
        kind: "upsertFile",
        path: "/opt/project/pages/script_a.sh",
        oldData: SCRIPT_SH_A,
        newData: "\nnode_modules/.bin/next build\n",
      },
      {
        kind: "upsertFile",
        path: "/opt/project/pages/next.config.js",
        oldData: NEXT_CONFIG_JSON,
        newData:
          "\nmodule.exports = {\n\tdistDir: 'out',\n    output: \"export\"\n}",
      },
      {
        kind: "upsertFile",
        path: "/opt/project/pages/README.md",
        oldData: README_MD,
        newData: "\n# Header\n",
      },
    ]);
  });
});
