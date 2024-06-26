import type { PrinterBlueprint } from "@codemod-com/printer";
import type { TelemetrySender } from "@codemod-com/telemetry";
import { type fs, vol } from "memfs";
import { afterEach, describe, expect, it, vi } from "vitest";

import { randomBytes } from "node:crypto";
import type { GlobalArgvOptions, RunArgvOptions } from "../buildOptions";
import { handleRunCliCommand } from "../commands/run";

const mockedArgs = {
  _: ["recipe1"],
  target: "./target",
  telemetry: true,
  cache: true,
  format: true,
  threads: 1,
  dry: false,
  install: true,
  "disable-tree-version-check": true,
} as unknown as GlobalArgvOptions & RunArgvOptions;

const mockedSendDangerousEvent = vi.fn();

const mockedTelemetry = {
  sendDangerousEvent: mockedSendDangerousEvent,
  sendEvent: vi.fn(),
  sendError: vi.fn(),
} as unknown as TelemetrySender<any>;

const mockedPrinter = {
  __jsonOutput: true,
  printMessage: vi.fn(),
  printOperationMessage: vi.fn(),
  printConsoleMessage: vi.fn(),
  withLoaderMessage: vi.fn(),
} as unknown as PrinterBlueprint;

const mocks = vi.hoisted(() => {
  return {
    CodemodDownloader: vi.fn(),
  };
});

const mockedRecipe = {
  bundleType: "package",
  source: "registry",
  name: "recipe1",
  version: "1.0.0",
  engine: "recipe",
  codemods: [
    {
      bundleType: "package",
      source: "registry",
      name: "codemod1",
      version: "1.0.0",
      engine: "jscodeshift",
      indexPath: "./codemods/codemod1/dist/index.cjs",
      directoryPath: "./codemods/codemod1",
      arguments: [],
    },
    {
      bundleType: "package",
      source: "registry",
      name: "codemod2",
      version: "1.0.0",
      engine: "jscodeshift",
      indexPath: "./codemods/codemod2/dist/index.cjs",
      directoryPath: "./codemods/codemod2",
      arguments: [],
    },
  ],
  directoryPath: "./codemods/recipe1",
  arguments: [],
};

const mockedCodemod = {
  bundleType: "package",
  source: "registry",
  name: "codemod1",
  version: "1.0.0",
  engine: "jscodeshift",
  indexPath: "./codemods/codemod1/dist/index.cjs",
  directoryPath: "./codemods/codemod1",
  arguments: [],
};

vi.mock("../downloadCodemod.ts", async () => {
  return {
    CodemodDownloader: mocks.CodemodDownloader,
  };
});

vi.mock("../fileDownloadService.ts");
vi.mock("node:fs/promises", async () => {
  const memfs: { fs: typeof fs } = await vi.importActual("memfs");

  return memfs.fs.promises;
});

vi.mock("../../../../packages/runner/dist/buildGlobGenerator.js", () => {
  return {
    buildPathGlobGenerator: async function* () {
      yield "target/src/index.tsx";
    },
  };
});

vi.mock("../../../../packages/runner/dist/workerThreadManager.js", () => {
  return {
    WorkerThreadManager: function WorkerThreadManager(...args: any[]) {
      const onMessage = args[2];
      const onCommand = args[3];

      onCommand({
        kind: "updateFile",
        oldPath: `./target/src/file_${randomBytes(8).toString("hex")}.tsx`,
        oldData: "",
        newData: "updated",
        formatWithPrettier: false,
      });

      onMessage({
        kind: "finish",
      });
    },
  };
});

vi.mock(
  "../../../../packages/runner/dist/fileCommands.js",
  (requireOriginal) => {
    return {
      ...requireOriginal,
      modifyFileSystemUponCommand: vi.fn(),
    };
  },
);

const memfsVolumeJSON = {
  "codemods/codemod1/dist/index.cjs": `module.exports = function transform(file, api, options) {
    return "transformed by codemod1"
  `,
  "codemods/codemod2/dist/index.cjs": `module.exports = function transform(file, api, options) {
    return "transformed by codemod2"
  `,
  "codemods/codemod1/.codemodrc.json": `{
    "version": "1.0.0",
    "private": false,
    "name": "codemod1",
    "engine": "jscodeshift"
  }`,
  "codemods/codemod2/.codemodrc.json": `{
    "version": "1.0.0",
    "private": false,
    "name": "codemod2",
    "engine": "jscodeshift"
  }`,
  "codemods/recipe1/.codemodrc.json": `{
    "name": "recipe1",
    "version": "1.0.0",
    "private": false,
    "engine": "recipe",
    "names": ["codemod1", "codemod2"]
}`,
};

afterEach(() => {
  mockedSendDangerousEvent.mockReset();
});

describe("Run command", () => {
  // tracks both subcodemod runs and recipe run
  it("Should properly track recipe and  sub-codemods of the recipe", async () => {
    vol.fromJSON(memfsVolumeJSON);

    mocks.CodemodDownloader.mockReturnValue({
      async download() {
        return mockedRecipe;
      },
    });

    await handleRunCliCommand({
      printer: mockedPrinter,
      args: mockedArgs,
      telemetry: mockedTelemetry,
    });

    expect(
      mockedSendDangerousEvent.mock.calls.map(
        ([{ executionId, ...rest }]) => rest,
      ),
    ).toStrictEqual([
      {
        kind: "codemodExecuted",
        codemodName: "codemod1",
        fileCount: 1,
        recipeName: "recipe1",
      },
      {
        kind: "codemodExecuted",
        codemodName: "codemod2",
        fileCount: 1,
        recipeName: "recipe1",
      },
      {
        kind: "codemodExecuted",
        codemodName: "recipe1",
        fileCount: 2,
        recipeName: "recipe1",
      },
    ]);
  });

  it("Should properly track single codemod", async () => {
    vol.fromJSON(memfsVolumeJSON);

    mocks.CodemodDownloader.mockReturnValue({
      download() {
        return mockedCodemod;
      },
    });

    await handleRunCliCommand({
      printer: mockedPrinter,
      args: {
        ...mockedArgs,
        _: ["codemod1"],
      },
      telemetry: mockedTelemetry,
    });

    const { executionId, ...event } = mockedSendDangerousEvent.mock.calls[0][0];

    expect(event).toStrictEqual({
      kind: "codemodExecuted",
      codemodName: "codemod1",
      fileCount: 1,
    });
  });
});
