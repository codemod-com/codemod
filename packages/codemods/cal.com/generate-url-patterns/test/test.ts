import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import jscodeshift from "jscodeshift";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (
  json: DirectoryJSON,
  options: {
    turboPath: string;
    abTestMiddlewarePath: string;
    middlewarePath: string;
    generateAsPageGroup?: boolean;
  },
) => {
  const volume = Volume.fromJSON(json);

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  const api = buildApi<{ jscodeshift: typeof jscodeshift }>(
    unifiedFileSystem,
    () => ({
      jscodeshift,
    }),
    pathApi,
  );

  return executeFilemod(api, repomod, "/", options, {});
};

type ExternalFileCommand = Awaited<ReturnType<typeof transform>>[number];

const removeWhitespaces = (
  command: ExternalFileCommand,
): ExternalFileCommand => {
  if (command.kind !== "upsertFile") {
    return command;
  }

  return {
    ...command,
    oldData: command.oldData.replace(/\s/gm, ""),
    newData: command.newData.replace(/\s/gm, ""),
  };
};

const turboContent = JSON.stringify({
  globalEnv: ["OTHER_ENVVAR"],
});

const abTestMiddlewareContent = `
  import { type X } from 'y';
  const other = true;
`;
const middlewareContent = `
  export const config = {
    matcher: [
      "otherPath", 
    ]
  }
`;

describe("generate-url-patterns", () => {
  it("should build correct files", async () => {
    const [turboJsonCommand, middlewareTsCommand, abTestMiddlewareTsCommand] =
      await transform(
        {
          "/opt/project/turbo.json": turboContent,
          "/opt/project/abTestMiddleware.ts": abTestMiddlewareContent,
          "/opt/project/middleware.ts": middlewareContent,
          "/opt/project/app/future/noSegment/page.tsx": "",
          "/opt/project/app/future/dynamicSegment/[a]/page.tsx": "",
          "/opt/project/app/future/dynamicSegment/[b]/[c]/page.tsx": "",
          "/opt/project/app/future/catchAllDynamicSegments/[...d]/page.tsx": "",
          "/opt/project/app/future/(someLayout)/optionalCatchAllDynamicSegments/[[...element]]/f/page.tsx":
            "",
        },
        {
          turboPath: "/opt/project/turbo.json",
          abTestMiddlewarePath: "/opt/project/abTestMiddleware.ts",
          middlewarePath: "/opt/project/middleware.ts",
        },
      );

    const newData = JSON.stringify({
      globalEnv: [
        "APP_ROUTER_CATCHALLDYNAMICSEGMENTS_D_ENABLED",
        "APP_ROUTER_DYNAMICSEGMENT_A_ENABLED",
        "APP_ROUTER_DYNAMICSEGMENT_B_C_ENABLED",
        "APP_ROUTER_NOSEGMENT_ENABLED",
        "APP_ROUTER_OPTIONALCATCHALLDYNAMICSEGMENTS_ELEMENT_F_ENABLED",
        "OTHER_ENVVAR",
      ],
    });

    deepStrictEqual(removeWhitespaces(turboJsonCommand!), {
      kind: "upsertFile",
      path: "/opt/project/turbo.json",
      oldData: turboContent,
      newData,
    });

    deepStrictEqual(
      removeWhitespaces(abTestMiddlewareTsCommand!),
      removeWhitespaces({
        kind: "upsertFile",
        path: "/opt/project/abTestMiddleware.ts",
        oldData: abTestMiddlewareContent,
        newData: `import { type X } from 'y';
				const other = true;

				const ROUTES: [URLPattern, boolean][] = [
					[
						"/catchAllDynamicSegments/:d+",
						Boolean(process.env.APP_ROUTER_CATCHALLDYNAMICSEGMENTS_D_ENABLED)
					] as const,
					[
						"/dynamicSegment/:a",
						Boolean(process.env.APP_ROUTER_DYNAMICSEGMENT_A_ENABLED)
					] as const,
					[
						"/dynamicSegment/:b/:c",
						Boolean(process.env.APP_ROUTER_DYNAMICSEGMENT_B_C_ENABLED)
					] as const,
					["/noSegment", Boolean(process.env.APP_ROUTER_NOSEGMENT_ENABLED)] as const,
					[
						"/optionalCatchAllDynamicSegments/:element*/f",
						Boolean(process.env.APP_ROUTER_OPTIONALCATCHALLDYNAMICSEGMENTS_ELEMENT_F_ENABLED)
					] as const
				].map(([pathname, enabled]) => [new URLPattern({
					pathname
				}), enabled]);
`,
      }),
    );

    deepStrictEqual(
      removeWhitespaces(middlewareTsCommand!),
      removeWhitespaces({
        kind: "upsertFile",
        path: "/opt/project/middleware.ts",
        oldData: middlewareContent,
        newData: `
				export const config = {
					matcher: [
						"otherPath", 
						"/noSegment",
						"/future/noSegment/",

            "/dynamicSegment/:a",
						"/future/dynamicSegment/:a/",

            "/catchAllDynamicSegments/:d+",
						"/future/catchAllDynamicSegments/:d+/",

						"/dynamicSegment/:b/:c",
						"/future/dynamicSegment/:b/:c/",

						"/optionalCatchAllDynamicSegments/:element*/f", 
						"/future/optionalCatchAllDynamicSegments/:element*/f/"
					]
				}
			`,
      }),
    );
  });

  it("should support generateAsPageGroup option", async () => {
    const [turboJsonCommand, abTestMiddlewareTsCommand] = await transform(
      {
        "/opt/project/turbo.json": turboContent,
        "/opt/project/abTestMiddleware.ts": abTestMiddlewareContent,
        "/opt/project/app/future/top-level/page.tsx": "",
        "/opt/project/app/future/top-level/a/page.tsx": "",
        "/opt/project/app/future/top-level/b/page.tsx": "",
        "/opt/project/app/future/top-level/a/b/page.tsx": "",
      },
      {
        turboPath: "/opt/project/turbo.json",
        abTestMiddlewarePath: "/opt/project/abTestMiddleware.ts",
        middlewarePath: "/opt/project/middleware.ts",
        generateAsPageGroup: true,
      },
    );

    const newData = JSON.stringify({
      globalEnv: ["APP_ROUTER_TOP_LEVEL_ENABLED", "OTHER_ENVVAR"],
    });

    deepStrictEqual(removeWhitespaces(turboJsonCommand!), {
      kind: "upsertFile",
      path: "/opt/project/turbo.json",
      oldData: turboContent,
      newData,
    });

    deepStrictEqual(
      removeWhitespaces(abTestMiddlewareTsCommand!),
      removeWhitespaces({
        kind: "upsertFile",
        path: "/opt/project/abTestMiddleware.ts",
        oldData: abTestMiddlewareContent,
        newData: `import { type X } from 'y';
				const other = true;

				const ROUTES: [URLPattern, boolean][] = [
					[
						"/top-level/:path*",
						Boolean(process.env.APP_ROUTER_TOP_LEVEL_ENABLED)
					] as const
				].map(([pathname, enabled]) => [new URLPattern({
					pathname
				}), enabled]);`,
      }),
    );
  });
});
