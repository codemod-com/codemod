import { deepEqual, ok } from "node:assert";
import { buildApi, executeFilemod } from "@codemod-com/filemod";
import { buildPathAPI, buildUnifiedFileSystem } from "@codemod-com/utilities";
import type { DirectoryJSON } from "memfs";
import { Volume, createFsFromVolume } from "memfs";
import { describe, it } from "vitest";
import { repomod } from "../src/index.js";

const transform = async (json: DirectoryJSON) => {
	const volume = Volume.fromJSON(json);

	const fs = createFsFromVolume(volume);

	const unifiedFileSystem = buildUnifiedFileSystem(fs);
	const pathApi = buildPathAPI("/");

	const api = buildApi(unifiedFileSystem, () => ({ fetch }), pathApi);

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

describe("eslint and prettier to biome migration", () => {
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
      "types": "/dist/index.d.ts",
      "scripts": {
        "start": "pnpm run build:cjs && node ./dist/index.cjs",
        "build:cjs": "cjs-builder ./src/index.ts",
        "lint:eslint": "eslint . --fix",
        "lint:prettier": "prettier --write ."
      },
      "eslintIgnore": ["ignore-key"],
      "files": [
        "prettier-test-no-replace",
        "README.md",
        ".codemodrc.json",
        "./dist/index.cjs",
        "./index.d.ts"
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

	const biomeJsonPath = "biome.json";

	it("should contain correct file commands", async () => {
		const externalFileCommands = await transform({
			[packageJsonPath]: packageJsonConfig,
			[eslintRcPath]: "",
			[eslintIgnorePath]: eslintIgnoreContent,
			[prettierRcPath]: prettierRcContent,
			[prettierIgnorePath]: "",
		});

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
		const externalFileCommands = await transform({
			[packageJsonPath]: packageJsonConfig,
			[eslintRcPath]: "",
			[eslintIgnorePath]: eslintIgnoreContent,
			[prettierRcPath]: prettierRcContent,
			[prettierIgnorePath]: "",
		});

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === "upsertFile" &&
					command.path === packageJsonPath &&
					command.data.replace(/\W/gm, "") ===
						`
              {
                "name": "package-name",
                "dependencies": {},
                "devDependencies": {
                  "@biomejs/biome": "1.5.3"
                },
                "main": "./dist/index.cjs",
                "types": "/dist/index.d.ts",
                "scripts": {
                  "start": "pnpm run build:cjs && node ./dist/index.cjs",
                  "build:cjs": "cjs-builder ./src/index.ts",
                  "lint:eslint": "pnpm dlx @biomejs/biome lint . --apply",
                  "lint:prettier": "pnpm dlx @biomejs/biome format --write .",
                  "NOTE": "You can apply both linter, formatter and import ordering by using https://biomejs.dev/reference/cli/#biome-check",
                  "NOTE2": "There is an ongoing work to release prettier-tailwind-plugin alternative: https://biomejs.dev/linter/rules/use-sorted-classes/, https://github.com/biomejs/biome/issues/1274"
                },
                "files": [
                  "prettier-test-no-replace",
<<<<<<< HEAD
                  "README.md",
                  ".codemodrc.json",
||||||| parent of 7dfbc06 (wip)
                  "DESCRIPTION.md",
                  "config.json",
=======
                  "DESCRIPTION.md",
                  ".codemodrc.json",
>>>>>>> 7dfbc06 (wip)
                  "./dist/index.cjs",
                  "./index.d.ts"
                ],
                "lint-staged": {
                  "*.js": "pnpm dlx @biomejs/biome lint --apply",
                  "*.ts": "pnpm dlx @biomejs/biome lint --apply"
                },
                "type": "module"
              }
	          `.replace(/\W/gm, ""),
			),
		);

		ok(
			externalFileCommands.some(
				(command) =>
					command.kind === "upsertFile" &&
					command.path === biomeJsonPath &&
					command.data.replace(/\W/gm, "") ===
						`
              {
                "linter": {
                  "ignore": [
                    "ignore-key",
                    "dist",
                    "build",
                    "pnpm-lock.yaml",
                    "node_modules"
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
                  "ignore": [],
                  "indentStyle": "tab"
                }
              }
	          `.replace(/\W/gm, ""),
			),
		);
	});
});
