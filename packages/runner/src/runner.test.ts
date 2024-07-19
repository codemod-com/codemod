// import { equal } from "node:assert";
// import { randomBytes } from "node:crypto";
// import { Volume, createFsFromVolume } from "memfs";
// import { describe, it } from "vitest";
// import type { CodemodDownloaderBlueprint } from "../src/downloadCodemod.js";
// import type { Printer } from "../src/printer.js";
// import type { RepositoryConfiguration } from "../src/repositoryConfiguration.js";
// import { Runner } from "../src/runner.js";
// import type { CodemodSettings } from "../src/schemata/codemodSettingsSchema.js";
// import type { FlowSettings } from "../src/schemata/flowSettingsSchema.js";
// import type { RunSettings } from "../src/schemata/runArgvSettingsSchema.js";

// const CODEMOD_D_INDEX_TS = `
// export default function transform(file, api, options) {
// 	return \`"transformed \${file.path} \${options.argA} \${options.argB}"\`;
// }
// `;

// const CODEMOD_E_INDEX_TS = `
// export default function transform(file, api, options) {
// 	if (file.path === '/code/c.ts') {
// 		return \`"double transformed \${file.path} \${options.argA} \${options.argB}"\`;
// 	}
// 	return undefined;
// }
// `;

// const VUE_VUE = `
// <script setup>
// import { ref } from 'vue'
// const greeting = ref('Hello World!')
// </script>

// <template>
// <p class="greeting">{{ greeting }}</p>
// </template>

// <style>
// .greeting {
// color: red;
// font-weight: bold;
// }
// </style>
// `;

// const MDX_MDX = `
// import { Chart } from './snowfall.js';
// export const year = 2023;

// # Last year’s snowfall

// In {year}, the snowfall was above average.
// It was followed by a warm spring which caused
// flood conditions in many of the nearby rivers.

// <Chart b={'erwe'} />
// `;

// const SOURCED_CODEMOD = `module.exports = function transform(file, api, options) {
//   return "transformed";
// } `;

// const printer: Printer = {
// 	__jsonOutput: false,
// 	printMessage: () => {},
// 	printOperationMessage: () => {},
// 	printConsoleMessage: () => {},
// };

// describe("Runner", () => {
// 	it("should transform staged files using the pre-commit codemods", async () => {
// 		const volume = Volume.fromJSON({
// 			"/code/a.ts": "unchanged",
// 			"/code/b.ts": "unchanged",
// 			"/code/c.ts": "unchanged",
// 			"/code/e.ts": "unchanged",
// 			"/codemods/d/index.ts": CODEMOD_D_INDEX_TS,
// 			"/codemods/e/index.ts": CODEMOD_E_INDEX_TS,
// 		});

// 		const ifs = createFsFromVolume(volume);

// 		const codemodDownloader: CodemodDownloaderBlueprint = {
// 			download: async (name: string) => {
// 				return {
// 					source: "package",
// 					name,
// 					engine: "jscodeshift",
// 					indexPath: `/codemods/${name}/index.ts`,
// 					directoryPath: `/codemods/${name}`,
// 					arguments: [
// 						{
// 							name: "argA",
// 							kind: "number",
// 							required: false,
// 						},
// 						{
// 							name: "argB",
// 							kind: "number",
// 							required: false,
// 						},
// 					],
// 				};
// 			},
// 		};

// 		const loadRepositoryConfiguration = () =>
// 			Promise.resolve<RepositoryConfiguration>({
// 				preCommitCodemods: [
// 					{
// 						source: "package",
// 						name: "d",
// 						arguments: {
// 							argA: 1,
// 							argB: 2,
// 						},
// 					},
// 					{
// 						source: "package",
// 						name: "e",
// 						arguments: {
// 							argA: 3,
// 							argB: 4,
// 						},
// 					},
// 				],
// 			});

// 		const codemodSettings: CodemodSettings = {
// 			kind: "runOnPreCommit",
// 		};

// 		const flowSettings: FlowSettings = {
// 			include: [],
// 			exclude: [],
// 			target: "/code",
// 			files: ["/code/a.ts", "/code/b.ts", "/code/c.ts"],
// 			raw: true,
// 			"no-cache": false,
// 			noCache: false,
// 			json: true,
// 			threads: 1,
// 			skipInstall: false,
// 			"skip-install": false,
// 		};

// 		const currentWorkingDirectory = "/";

// 		const getCodemodSource = async (path: string) => {
// 			const data = await ifs.promises.readFile(path);

// 			if (typeof data === "string") {
// 				return data;
// 			}

// 			return data.toString("utf8");
// 		};

// 		const runSettings: RunSettings = {
// 			dryRun: false,
// 			caseHashDigest: randomBytes(20),
// 		};

// 		const runner = new Runner(
// 			ifs,
// 			printer,
// 			{
// 				sendEvent: () => {},
// 			},
// 			codemodDownloader,
// 			loadRepositoryConfiguration,
// 			codemodSettings,
// 			flowSettings,
// 			runSettings,
// 			{},
// 			null,
// 			currentWorkingDirectory,
// 			getCodemodSource,
// 		);

// 		await runner.run();

// 		equal(
// 			(await volume.promises.readFile("/code/a.ts")).toString(),
// 			'"transformed /code/a.ts 1 2"',
// 		);

// 		equal(
// 			(await volume.promises.readFile("/code/b.ts")).toString(),
// 			'"transformed /code/b.ts 1 2"',
// 		);

// 		equal(
// 			(await volume.promises.readFile("/code/c.ts")).toString(),
// 			'"double transformed /code/c.ts 3 4"',
// 		);

// 		equal(
// 			(await volume.promises.readFile("/code/e.ts")).toString(),
// 			"unchanged",
// 		);
// 	});

// 	it("should apply adapters for mdx and vue file formats", async () => {
// 		const volume = Volume.fromJSON({
// 			"/code/vue.vue": VUE_VUE,
// 			"/code/mdx.mdx": MDX_MDX,
// 			"/codemods/a/index.js": SOURCED_CODEMOD,
// 		});

// 		const ifs = createFsFromVolume(volume);

// 		const codemodDownloader: CodemodDownloaderBlueprint = {
// 			download: async (name: string) => {
// 				return {
// 					source: "package",
// 					name,
// 					engine: "jscodeshift",
// 					indexPath: `/codemods/${name}/index.ts`,
// 					directoryPath: `/codemods/${name}`,
// 					arguments: [],
// 				};
// 			},
// 		};

// 		const codemodSettings: CodemodSettings = {
// 			kind: "runSourced",
// 			source: "/codemods/a/index.js",
// 			codemodEngine: "jscodeshift",
// 		};

// 		const flowSettings: FlowSettings = {
// 			include: ["**/*.{ts,tsx,vue,mdx}"],
// 			exclude: [],
// 			target: "/code",
// 			raw: false,
// 			"no-cache": false,
// 			noCache: false,
// 			"skip-install": true,
// 			skipInstall: true,
// 			json: false,
// 			threads: 1,
// 		};

// 		const runSettings: RunSettings = {
// 			dryRun: false,
// 			caseHashDigest: randomBytes(20),
// 		};

// 		const runner = new Runner(
// 			codemods,
// 			ifs,
// 			printer,
// 			runSettings,
// 			flowSettings,
// 		);

// 		await runner.run(
// 			() => {},
// 			() => {},
// 		);

// 		await new Promise((res) => {
// 			setTimeout(res, 1000);
// 		});

// 		equal(
// 			(await volume.promises.readFile("/code/vue.vue"))
// 				.toString()
// 				.replace(/\W/gm, ""),
// 			`
//         <script setup>
//         transformed
//         </script>

//         <template>
//         <p class="greeting">{{ greeting }}</p>
//         </template>

//         <style>
//         .greeting {
//         color: red;
//         font-weight: bold;
//         }
//         </style>
//       `.replace(/\W/gm, ""),
// 		);

// 		equal(
// 			(await volume.promises.readFile("/code/mdx.mdx"))
// 				.toString()
// 				.replace(/\W/gm, ""),
// 			`
//       transformed

//       # Last year’s snowfall

//       In {year}, the snowfall was above average.
//       It was followed by a warm spring which caused
//       flood conditions in many of the nearby rivers.

//        transformed
//       `.replace(/\W/gm, ""),
// 		);
// 	});
// });
