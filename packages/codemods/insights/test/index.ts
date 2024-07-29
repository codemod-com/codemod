import { workflow } from "src";
import { describe, expect, it } from "vitest";

// mocked data for test-package package
const mockedNormalizedPackageRegistryData = {
  latest: "0.11.31",
  next: null,
  versions: [
    "0.0.1",
    "0.0.2",
    "0.0.3",
    "0.0.4",
    "0.8.0-rc1",
    "0.8.0",
    "0.8.1",
    "0.8.2",
    "0.8.3",
    "0.8.4",
    "0.8.6",
    "0.8.7",
    "0.8.8",
    "0.9.0",
    "0.9.1",
    "0.9.2",
    "0.9.3",
    "0.9.4",
    "0.9.5",
    "0.9.6",
    "0.9.7",
    "0.10.1",
    "0.10.2",
    "0.10.3",
    "0.10.5",
    "0.10.6",
    "0.10.7",
    "0.10.8",
    "0.10.12",
    "0.10.13",
    "0.10.14",
    "0.10.15",
    "0.10.16",
    "0.10.17",
    "0.10.18",
    "0.10.19",
    "0.10.20",
    "0.10.21",
    "0.10.22",
    "0.10.23",
    "0.10.26",
    "0.10.27",
    "0.11.0",
    "0.11.1",
    "0.11.2",
    "0.11.4",
    "0.11.5",
    "0.11.6",
    "0.11.7",
    "0.11.8",
    "0.11.9",
    "0.11.10",
    "0.11.11",
    "0.11.12",
    "0.11.13",
    "0.11.14",
    "0.11.15",
    "0.11.16",
    "0.11.17",
    "0.11.18",
    "0.11.19",
    "0.11.20",
    "0.11.21",
    "0.11.22",
    "0.11.24",
    "0.11.25",
    "0.11.26",
    "0.11.28",
    "0.11.30",
    "0.11.31",
  ],
  homepage: "https://github.com/test-package",
};

// vi.mock("../src/registry-utils.ts", async (requireOriginal) => {
//   const actual = await requireOriginal();

//   return {
//     ...actual,
//     normalizePackageRegistryData: vi.fn(
//       () => mockedNormalizedPackageRegistryData,
//     ),
//   };
// });

const buildAPI = (filesContent: Record<string, any>) => {
  const files = (pattern: string) => ({
    yaml: () => ({
      map: (cb: (...args: any[]) => Promise<any>) => {
        cb({ getContents: async () => ({}) });
      },
    }),
    json: () => ({
      map: async (cb: (...args: any[]) => Promise<any>) => {
        const promises = filesContent[pattern]?.map(
          async (content: any) =>
            await cb({ getContents: async () => content }),
        );

        await Promise.all(promises);
      },
    }),
  });

  return {
    git: {
      clone: async (_: any, cb: (...args: any[]) => Promise<any>) => {
        await cb({ files });
      },
    },
  };
};

describe("Insights workflow", async () => {
  it("Should correctly generate insight for package with minor version update", async () => {
    const minorVersion = {
      name: "insights",
      license: "MIT",
      devDependencies: {
        "@codemod.com/workflow": "workspace:*",
        "@types/node": "20.9.0",
        typescript: "^5.2.2",
        vitest: "^1.0.1",
      },
      scripts: {
        test: "vitest run",
      },
      files: ["README.md", ".codemodrc.json", "/dist/index.cjs"],
      dependencies: {
        "@ast-grep/napi": "^0.25.1",
        "@types/semver": "^7.5.8",
        "@types/semver-diff": "^3.0.0",
        "date-fns": "^3.6.0",
        depcheck: "^1.4.7",
        "git-url-parse": "^14.1.0",
        giturl: "^2.0.0",
        "npm-check": "^6.0.1",
        semver: "^7.6.3",
        "semver-diff": "^4.0.0",
      },
    };

    const files = {
      "**/apps/**/package.json": [minorVersion],
    };

    const api = buildAPI(files);
    const result = await workflow(api, { repos: [] });

    expect(result).toStrictEqual({
      "the-package": [
        {
          moduleName: "test-package",
          homepage: "https://github.com/test-package",
          latest: "0.11.31",
          installed: "0.10.27",
          packageWanted: "0.10.27",
          packageJson: "^0.10.10",
          mismatch: false,
          semverValid: "0.10.27",
          easyUpgrade: false,
          bump: "minor",
        },
      ],
    });
  });
});
