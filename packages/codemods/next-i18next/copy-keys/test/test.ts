import { deepStrictEqual } from 'node:assert';
import { buildApi, executeFilemod } from '@codemod-com/filemod';
import { buildPathAPI, buildUnifiedFileSystem } from '@codemod-com/utilities';
import type { DirectoryJSON } from 'memfs';
import { Volume, createFsFromVolume } from 'memfs';
import { describe, it } from 'vitest';
import { repomod } from '../src/index.js';

type Options = Readonly<Record<string, string | number | boolean | undefined>>;

let transform = async (json: DirectoryJSON, options: Options) => {
	let volume = Volume.fromJSON(json);

	let fs = createFsFromVolume(volume);

	let unifiedFileSystem = buildUnifiedFileSystem(fs);
	let pathApi = buildPathAPI('/');

	let api = buildApi<Record<string, never>>(
		unifiedFileSystem,
		() => ({}),
		pathApi,
	);

	return executeFilemod(api, repomod, '/', options, {});
};

describe('next-i18n copy keys', () => {
	it('should copy a key into a new namespace', async () => {
		let EN_COMMON_JSON = `
			{
				"copyKey": "copyKeyEnglish",
				"noopKey": "noopKeyEnglish"
			}
		`;

		let DE_COMMON_JSON = `
			{
				"copyKey": "copyKeyGerman",
				"noopKey": "noopKeyGerman"
			}
		`;

		let [upsertDeDataCommand, upsertEnDataCommand] = await transform(
			{
				'/opt/project/public/static/locales/en/common.json':
					EN_COMMON_JSON,
				'/opt/project/public/static/locales/de/common.json':
					DE_COMMON_JSON,
			},
			{
				oldNamespace: 'common',
				newNamespace: 'new',
				keys: 'copyKey',
			},
		);
		deepStrictEqual(upsertEnDataCommand?.kind, 'upsertFile');

		deepStrictEqual(
			upsertEnDataCommand.path,
			'/opt/project/public/static/locales/en/new.json',
		);

		deepStrictEqual(
			upsertEnDataCommand.data.replace(/\W/gm, ''),
			`{"copyKey": "copyKeyEnglish"}`.replace(/\W/gm, ''),
		);
		deepStrictEqual(upsertDeDataCommand?.kind, 'upsertFile');

		deepStrictEqual(
			upsertDeDataCommand.path,
			'/opt/project/public/static/locales/de/new.json',
		);

		deepStrictEqual(
			upsertDeDataCommand.data.replace(/\W/gm, ''),
			`{"copyKey": "copyKeyGerman"}`.replace(/\W/gm, ''),
		);
	});

	it('should copy a key into an existing namespace', async () => {
		let EN_COMMON_JSON = `
			{
				"copyKey": "copyKeyEnglish",
				"noopKey": "noopKeyEnglish"
			}
		`;

		let EN_EXISTING_JSON = `
			{
				"otherKey": "otherKeyEnglish"
			}
		`;

		let DE_COMMON_JSON = `
			{
				"copyKey": "copyKeyGerman",
				"noopKey": "noopKeyGerman"
			}
		`;

		let DE_EXISTING_JSON = `
			{
				"otherKey": "otherKeyGerman"
			}
		`;

		let [upsertDeDataCommand, upsertEnDataCommand] = await transform(
			{
				'/opt/project/public/static/locales/en/common.json':
					EN_COMMON_JSON,
				'/opt/project/public/static/locales/en/existing.json':
					EN_EXISTING_JSON,
				'/opt/project/public/static/locales/de/common.json':
					DE_COMMON_JSON,
				'/opt/project/public/static/locales/de/existing.json':
					DE_EXISTING_JSON,
			},
			{
				oldNamespace: 'common',
				newNamespace: 'existing',
				keys: 'copyKey',
			},
		);
		deepStrictEqual(upsertEnDataCommand?.kind, 'upsertFile');

		deepStrictEqual(
			upsertEnDataCommand.path,
			'/opt/project/public/static/locales/en/existing.json',
		);

		deepStrictEqual(
			upsertEnDataCommand.data.replace(/\W/gm, ''),
			`{"otherKey": "otherKeyEnglish","copyKey": "copyKeyEnglish"}`.replace(
				/\W/gm,
				'',
			),
		);
		deepStrictEqual(upsertDeDataCommand?.kind, 'upsertFile');

		deepStrictEqual(
			upsertDeDataCommand.path,
			'/opt/project/public/static/locales/de/existing.json',
		);

		deepStrictEqual(
			upsertDeDataCommand.data.replace(/\W/gm, ''),
			`{"otherKey": "otherKeyGerman","copyKey": "copyKeyGerman",}`.replace(
				/\W/gm,
				'',
			),
		);
	});
});
