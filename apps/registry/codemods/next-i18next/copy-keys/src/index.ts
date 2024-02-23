import type { Filemod } from "@codemod-com/filemod";

type Dependencies = Record<string, never>;
type State = {
	oldNamespace: string;
	newNamespace: string;
	keys: ReadonlyArray<string>;
	map: Map<string, string>;
};

export const repomod: Filemod<Dependencies, State> = {
	includePatterns: ["**/locales/**/*.json"],
	excludePatterns: ["**/node_modules/**"],
	initializeState: async (options) => {
		const oldNamespace = options["oldNamespace"];
		const newNamespace = options["newNamespace"];
		const keys = options["keys"];

		return {
			oldNamespace: typeof oldNamespace === "string" ? oldNamespace : "common",
			newNamespace: typeof newNamespace === "string" ? newNamespace : "new",
			keys: typeof keys === "string" ? keys.split(",") : [],
			map: new Map(),
		};
	},
	handleFile: async (api, path, options, state) => {
		if (state === null) {
			return [];
		}

		const basename = api.getBasename(path);

		if (basename !== `${state.oldNamespace}.json`) {
			return [];
		}

		try {
			const dirname = api.getDirname(path);
			const newPath = api.joinPaths(dirname, `${state.newNamespace}.json`);

			const json = await api.readFile(path);
			const data = JSON.parse(json);

			for (const key of state.keys) {
				const value = data[key];

				if (typeof value !== "string") {
					continue;
				}

				state?.map.set(`${newPath}:${key}`, value);
			}

			return [
				{
					kind: "upsertFile",
					path: newPath,
					options,
				},
			];
		} catch {
			return [];
		}
	},
	handleData: async (_, path, oldData, ___, state) => {
		if (state === null) {
			return { kind: "noop" };
		}

		const record: Record<string, string> = {};

		try {
			const oldRecord = JSON.parse(oldData);

			for (const [key, value] of Object.entries(oldRecord)) {
				record[key] = String(value);
			}
		} catch {
			/* empty */
		}

		let i = 0;

		for (const key of state.keys) {
			const value = state.map.get(`${path}:${key}`);

			if (value === undefined) {
				continue;
			}

			record[key] = value;
			++i;
		}

		if (i === 0) {
			return { kind: "noop" };
		}

		const newData = JSON.stringify(record);

		return {
			kind: "upsertData",
			path,
			data: newData,
		};
	},
};
