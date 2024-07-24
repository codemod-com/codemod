import { deepEqual, ok } from "node:assert";
import { type API, buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const buildInternalAPI = async (json: DirectoryJSON) => {
  const volume = Volume.fromJSON(json);

  const fs = createFsFromVolume(volume);

  const unifiedFileSystem = buildUnifiedFileSystem(fs);
  const pathApi = buildPathAPI("/");

  return buildApi(unifiedFileSystem, () => ({ fetch }), pathApi);
};

const transform = async (api: API<any>) => {
  return executeFilemod(
    api,
    repomod,
    "/",
    {
      input: JSON.stringify({
        rules: {
          eqeqeq: ["warn", "smart"],
          "no-cond-assign": ["warn", "except-parens"],
          "no-unused-vars": ["off"],
        },
        ignorePatterns: [
          "**/dist/**",
          "**/build/**",
          "pnpm-lock.yaml",
          "**/node_modules/**",
        ],
      }),
    },
    {},
  );
};

describe("eslint and prettier to biome migration", async () => {
  const packageJsonPath = "/opt/project/package.json";
  const packageJsonConfig = `
    {
      "name": "package-name",
      "dependencies": {
        "prettier": "^3.1.0",
        "prettier-plugin-tailwindcss": "^0.5.4",
        "@tanstack/eslint-plugin-query": "^4.29.25",
        "@someorg/prettier-config": "^1.1.1"
      },
      "devDependencies": {
        "eslint-plugin-airbnb": "^10.2.0",
        "eslint": "^10.2.0",
        "eslint-plugin-prettier": "^10.2.0",
        "eslint-config-prettier": "^10.2.0"
      },
      "main": "./dist/index.cjs",
      "scripts": {
        "start": "pnpm run build:cjs && node ./dist/index.cjs",
                "lint:eslint": "eslint . --fix",
        "lint:prettier": "prettier --write ."
      },
      "eslintIgnore": ["ignore-key"],
      "files": [
        "prettier-test-no-replace",
        "README.md",
        ".codemodrc.json",
        "./dist/index.cjs"
      ],
      "lint-staged": {
        "*.js": "eslint --fix",
        "*.ts": "eslint --fix"
      },
      "type": "module"
    }
  `;

  const eslintRcPath = "/opt/project/.eslintrc";
  const eslintIgnorePath = "/opt/project/.eslintignore";
  const eslintIgnoreContent = `
    # config-key: config-value
    dist
    build
    pnpm-lock.yaml
    node_modules
  `;

  const prettierRcPath = "/opt/project/.prettierrc";
  const prettierRcContent = `
    {
      "semi": false,
      "useTabs": true,
      "singleQuote": true,
      "trailingComma": "all"
    }
  `;
  const prettierIgnorePath = "/opt/project/.prettierignore";

  it("should contain correct file commands", async () => {
    const api = await buildInternalAPI({
      [packageJsonPath]: packageJsonConfig,
      [eslintRcPath]: "",
      [eslintIgnorePath]: eslintIgnoreContent,
      [prettierRcPath]: prettierRcContent,
      [prettierIgnorePath]: "",
    });
    const biomeJsonPath = api.fileAPI.joinPaths(
      api.fileAPI.currentWorkingDirectory,
      "biome.json",
    );

    const externalFileCommands = await transform(api);

    deepEqual(externalFileCommands.length, 6);

    ok(
      externalFileCommands.filter(
        (command) =>
          (command.kind === "upsertFile" && command.path === packageJsonPath) ||
          (command.kind === "deleteFile" && command.path === eslintRcPath) ||
          (command.kind === "deleteFile" &&
            command.path === eslintIgnorePath) ||
          (command.kind === "deleteFile" && command.path === prettierRcPath) ||
          (command.kind === "deleteFile" &&
            command.path === prettierIgnorePath) ||
          (command.kind === "upsertFile" && command.path === biomeJsonPath),
      ).length === externalFileCommands.length,
    );
  });

  it("should correctly modify package.json and create proper biome.json", async () => {
    const api = await buildInternalAPI({
      [packageJsonPath]: packageJsonConfig,
      [eslintRcPath]: "",
      [eslintIgnorePath]: eslintIgnoreContent,
      [prettierRcPath]: prettierRcContent,
      [prettierIgnorePath]: "",
    });
    const biomeJsonPath = api.fileAPI.joinPaths(
      api.fileAPI.currentWorkingDirectory,
      "biome.json",
    );

    const externalFileCommands = await transform(api);

    const packageJsonCommand = externalFileCommands.find(
      (command) =>
        command.kind === "upsertFile" && command.path === packageJsonPath,
    );

    ok(packageJsonCommand);
    ok(packageJsonCommand.kind === "upsertFile");
    deepEqual(
      packageJsonCommand.newData.replace(/\W/gm, ""),
      `
        {
          "name": "package-name",
          "dependencies": {},
          "devDependencies": {
            "@biomejs/biome": "1.5.3"
          },
          "main": "./dist/index.cjs",
          "scripts": {
            "start": "pnpm run build:cjs && node ./dist/index.cjs",
            "lint:eslint": "pnpm dlx @biomejs/biome lint . --apply",
            "lint:prettier": "pnpm dlx @biomejs/biome format --write .",
            "NOTE": "You can apply both linter, formatter and import ordering by using https://biomejs.dev/reference/cli/#biome-check",
            "NOTE2": "There is an ongoing work to release prettier-tailwind-plugin alternative: https://biomejs.dev/linter/rules/use-sorted-classes/, https://github.com/biomejs/biome/issues/1274"
          },
          "files": [
            "prettier-test-no-replace",
            "README.md",
            ".codemodrc.json",
            "./dist/index.cjs"
          ],
          "lint-staged": {
            "*.js": "pnpm dlx @biomejs/biome lint --apply",
            "*.ts": "pnpm dlx @biomejs/biome lint --apply"
          },
          "type": "module"
        }
      `.replace(/\W/gm, ""),
    );

    ok(
      externalFileCommands.some(
        (command) =>
          command.kind === "upsertFile" &&
          command.path === biomeJsonPath &&
          command.newData.replace(/\W/gm, "") ===
            `
              {
                "linter": {
                  "ignore": [
                    "dist",
                    "build",
                    "pnpm-lock.yaml",
                    "node_modules"
                    "ignore-key",
                  ],
                  "rules": {
                    "suspicious": {
                      "noDoubleEquals": "warn",
                      "noAssignInExpressions": "warn"
                    },
                    "correctness": {
                      "noUnusedVariables": "off"
                    }
                  }
                },
                "formatter": {
                  "indentStyle": "tab"
                  "ignore": [],
                }
              }
            `.replace(/\W/gm, ""),
      ),
    );
  });
});
