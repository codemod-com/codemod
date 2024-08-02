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

let mockIndex = -1;

const mockedPackageJSONs = [
  {
    name: "test-package",
    // zero drift
    dependencies: {},
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
      history: "^4.7.0",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
      history: "^4.7.0",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
      history: "^4.7.0",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
      history: "^4.7.0",
    },
  },
  {
    name: "test-package",
    dependencies: {
      "react-redux": "^4.4.5",
      "react-router": "^2.4.2",
      history: "^5.0.2",
    },
  },
];

const exec = (cmd: string) => {
  if (cmd.startsWith("git log")) {
    return `615e3d74054811a05a95fbb6b3f45f1911f63830 2024-07-29 18:23:45 +0300
5d021e35cabf87c93473351c8b78adc7c84ed09f 2024-07-29 18:23:05 +0300
38a2041e0f0393ec55fde309b4733f021958fa40 2024-07-29 18:23:05 +0300
f443cff51c4a527c6e167efac52c9fc1db5933c7 2024-07-29 18:23:05 +0300
31a512898394feabb26b0555e1207f6e7e23d8ce 2024-07-29 18:23:05 +0300
c07044c8b5e2adcf596d634833084c4b41d520f2 2024-07-29 18:22:59 +0300
36b628e755fa5874c102e9be06f4a0072edb9284 2024-07-29 17:45:49 +0300
6688e289bdf4933e0a5072c6931652299087f0fa 2024-07-29 12:27:26 +0300
69966f0b0bef10c0442b1b6e95a3a62852e11f6a 2024-07-27 18:23:57 +0200
91137009f998469a397e2489a86a03e440c0d88b 2024-07-27 18:09:18 +0200`;
  }

  if (cmd.startsWith("git checkout")) {
    mockIndex++;
  }
};

const buildAPI = () => {
  const files = () => ({
    yaml: () => ({
      map: async (cb: (...args: any[]) => Promise<any>) => {
        return [await cb({ getContents: async () => ({}) })];
      },
    }),
    json: () => ({
      map: async (cb: (...args: any[]) => Promise<any>) => {
        return [
          await cb({
            getContents: async () => mockedPackageJSONs[mockIndex] ?? {},
          }),
        ];
      },
    }),
  });

  return {
    git: {
      clone: async (_: any, cb: (...args: any[]) => Promise<any>) => {
        await cb({ files, exec });
      },
    },
  };
};

describe("Insights workflow", async () => {
  it("Should correctly generate insight for package with minor version update", async () => {
    const api = buildAPI();
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
