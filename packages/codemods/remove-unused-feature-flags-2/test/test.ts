import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import jscodeshift from "jscodeshift";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{
    jscodeshift: typeof jscodeshift;
  }>(
    unifiedFileSystem,
    () => ({
      jscodeshift,
    }),
    pathApi,
  );

  return executeFilemod(
    api,
    repomod,
    "/",
    {
      fileMarker: "marker",
      featureFlagName: "featureFlagA",
      functionName: "buildFeatureFlag",
    },
    {},
  );
};

const componentContent = `
  export async function Component() {
    const a = await featureFlagObject();
  }
`;

const directoryJSON: DirectoryJSON = {
  "/opt/project/featureFlags.ts": `
		const marker = 'marker';

		export const featureFlagObject = buildFeatureFlag({
			key: 'featureFlagA',
		});
	`,
  "/opt/project/component.ts": componentContent,
};

describe("remove unused feature flags 2", () => {
  it("should build correct files", async () => {
    const externalFileCommands = await transform(directoryJSON);

    deepStrictEqual(externalFileCommands.length, 1);

    deepStrictEqual(externalFileCommands[0], {
      kind: "upsertFile",
      path: "/opt/project/component.ts",
      oldData: componentContent,
      newData: `
  export async function Component() {
    const a = true;
  }
`,
    });
  });
});
