import type { PrinterBlueprint } from "@codemod-com/printer";
import type { TelemetrySender } from "@codemod-com/telemetry";
import { type fs, vol } from "memfs";
import { describe, expect, it, vi } from "vitest";

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
  sendError: () => {},
} as unknown as TelemetrySender<any>;

const mockedPrinter = {
  __jsonOutput: true,
  printMessage: () => {},
  printOperationMessage: () => {},
  printConsoleMessage: () => {},
  withLoaderMessage: () => "",
} as unknown as PrinterBlueprint;

const mockedCodemod = {
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

vi.mock("../downloadCodemod.ts", async () => {
  return {
    CodemodDownloader: function CodemodDownloader() {
      return {
        async download() {
          return mockedCodemod;
        },
      };
    },
  };
});
vi.mock("../fileDownloadService.ts");
vi.mock("node:fs/promises", async () => {
  const memfs: { fs: typeof fs } = await vi.importActual("memfs");

  return memfs.fs.promises;
});

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
  "target/src/index.tsx": "const a = 1;",
};

describe("Run command", () => {
  it("Should properly track children codemods of the recipe", async () => {
    vol.fromJSON(memfsVolumeJSON);

    await handleRunCliCommand({
      printer: mockedPrinter,
      args: mockedArgs,
      telemetry: mockedTelemetry,
    });

    // dropping executionId because its random
    expect(
      mockedSendDangerousEvent.mock.calls.map(
        ([{ executionId, ...rest }]) => rest,
      ),
    ).toStrictEqual([
      {
        kind: "codemodExecuted",
        codemodName: "codemod1",
        fileCount: 0,
        recipeName: "recipe1",
      },
      {
        kind: "codemodExecuted",
        codemodName: "codemod2",
        fileCount: 0,
        recipeName: "recipe1",
      },
      {
        kind: "codemodExecuted",
        codemodName: "recipe1",
        fileCount: 0,
        recipeName: "recipe1",
      },
    ]);
  });
});
