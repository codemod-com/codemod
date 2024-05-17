import assert from 'node:assert/strict';
import { buildApi, trimLicense } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('history v4 use-location', () => {
	it('should replace history.getCurrentLocation() with history.location', async () => {
		let input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		const currentLocation = history.getCurrentLocation();
		`;

		let output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		const currentLocation = history.location;
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: trimLicense(input),
		};

		let actualOutput = transform(fileInfo, buildApi('js'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			trimLicense(output).replace(/\W/gm, ''),
		);
	});
});
