import type { Filemod } from '@codemod-com/filemod';

type Dependencies = Record<string, never>;
type State = {
	oldNamespace: string;
	newNamespace: string;
	keys: ReadonlyArray<string>;
	map: Map<string, string>;
};

export let repomod: Filemod<Dependencies, State> = {
	includePatterns: ['**/locales/**/*.json'],
	excludePatterns: ['**/node_modules/**'],
	initializeState: async (options) => {
		let oldNamespace = options.oldNamespace;
		let newNamespace = options.newNamespace;
		let keys = options.keys;

		return {
			oldNamespace:
				typeof oldNamespace === 'string' ? oldNamespace : 'common',
			newNamespace:
				typeof newNamespace === 'string' ? newNamespace : 'new',
			keys: typeof keys === 'string' ? keys.split(',') : [],
			map: new Map(),
		};
	},
	handleFile: async (api, path, options, state) => {
		if (state === null) {
			return [];
		}

		let basename = api.getBasename(path);

		if (basename !== `${state.oldNamespace}.json`) {
			return [];
		}

		try {
			let dirname = api.getDirname(path);
			let newPath = api.joinPaths(dirname, `${state.newNamespace}.json`);

			let json = await api.readFile(path);
			let data = JSON.parse(json);

			for (let key of state.keys) {
				let value = data[key];

				if (typeof value !== 'string') {
					continue;
				}

				state?.map.set(`${newPath}:${key}`, value);
			}

			return [
				{
					kind: 'upsertFile',
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
			return { kind: 'noop' };
		}

		let record: Record<string, string> = {};

		try {
			let oldRecord = JSON.parse(oldData);

			for (let [key, value] of Object.entries(oldRecord)) {
				record[key] = String(value);
			}
		} catch {
			/* empty */
		}

		let i = 0;

		for (let key of state.keys) {
			let value = state.map.get(`${path}:${key}`);

			if (value === undefined) {
				continue;
			}

			record[key] = value;
			++i;
		}

		if (i === 0) {
			return { kind: 'noop' };
		}

		let newData = JSON.stringify(record);

		return {
			kind: 'upsertData',
			path,
			data: newData,
		};
	},
};
