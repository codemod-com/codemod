import { deepStrictEqual } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import jscodeshift from "jscodeshift";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

type Options = Readonly<{
  hookModuleCreation?: boolean;
}>;

const transform = async (json: DirectoryJSON, options: Options) => {
  const volume = Volume.fromJSON(json);
  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/opt/project");

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
      useCompatSearchParamsHookRelativePath: "hooks/useCompatSearchParams.tsx",
      useCompatSearchParamsHookModuleSpecifier:
        "hooks/useCompatSearchParams.tsx",
      hookModuleCreation: options.hookModuleCreation,
    },
    {},
  );
};

describe("next 13 replace-replace-use-search-params", () => {
  it("should replace useSearchParams with useCompatSearchParams", async () => {
    const A_CONTENT = `
			import { useSearchParams, useParams } from 'next/navigation';

			export default function C() {
				const s = useSearchParams();

				return null;
			}
		`;

    const [upsertHookCommand, upsertFileCommand] = await transform(
      {
        "/opt/project/components/a.tsx": A_CONTENT,
      },
      {},
    );

    const expectedResult = `
		import { useCompatSearchParams } from "hooks/useCompatSearchParams.tsx";
		import { useParams } from 'next/navigation';

			export default function C() {
				const s = useCompatSearchParams();

				return null;
			}
		`;

    deepStrictEqual(upsertHookCommand?.kind, "upsertFile");
    deepStrictEqual(
      upsertHookCommand.path,
      "/opt/project/hooks/useCompatSearchParams.tsx",
    );

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(upsertFileCommand.path, "/opt/project/components/a.tsx");

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\s/gm, ""),
      expectedResult.replace(/\s/gm, ""),
    );
  });

  it("should replace useSearchParams with useCompatSearchParams but not create the hook file", async () => {
    const A_CONTENT = `
			import { useSearchParams, useParams } from 'next/navigation';

			export default function C() {
				const s = useSearchParams();

				return null;
			}
`;

    const [upsertFileCommand] = await transform(
      {
        "/opt/project/components/a.tsx": A_CONTENT,
      },
      {
        hookModuleCreation: false,
      },
    );

    const expectedResult = `
		import { useCompatSearchParams } from "hooks/useCompatSearchParams.tsx";
		import { useParams } from 'next/navigation';

			export default function C() {
				const s = useCompatSearchParams();

				return null;
			}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(upsertFileCommand.path, "/opt/project/components/a.tsx");

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\s/gm, ""),
      expectedResult.replace(/\s/gm, ""),
    );
  });

  it("should remove next/navigation import if no specifiers left after useSearchParams specifier removal", async () => {
    const A_CONTENT = `
			import { useSearchParams } from 'next/navigation';

			export default function C() {
				const s = useSearchParams();

				return null;
			}
`;

    const [, upsertFileCommand] = await transform(
      {
        "/opt/project/components/a.tsx": A_CONTENT,
      },
      {},
    );

    const expectedResult = `
		import { useCompatSearchParams } from "hooks/useCompatSearchParams.tsx";

			export default function C() {
				const s = useCompatSearchParams();

				return null;
			}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(upsertFileCommand.path, "/opt/project/components/a.tsx");

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\s/gm, ""),
      expectedResult.replace(/\s/gm, ""),
    );
  });

  it("should replace useSearchParams with useCompatSearchParams without creating the hook file", async () => {
    const A_CONTENT = `
			import { useSearchParams, useParams } from 'next/navigation';

			export default function C() {
				const s = useSearchParams();

				return null;
			}
`;

    const [upsertFileCommand] = await transform(
      {
        "/opt/project/components/a.tsx": A_CONTENT,
        "/opt/project/hooks/useCompatSearchParams.tsx": "",
      },
      {},
    );

    const expectedResult = `
		import { useCompatSearchParams } from "hooks/useCompatSearchParams.tsx";
		import { useParams } from 'next/navigation';

			export default function C() {
				const s = useCompatSearchParams();

				return null;
			}
		`;

    deepStrictEqual(upsertFileCommand?.kind, "upsertFile");
    deepStrictEqual(upsertFileCommand.path, "/opt/project/components/a.tsx");

    deepStrictEqual(
      upsertFileCommand.newData.replace(/\s/gm, ""),
      expectedResult.replace(/\s/gm, ""),
    );
  });
});
