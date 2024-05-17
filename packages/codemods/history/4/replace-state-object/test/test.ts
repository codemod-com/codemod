import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('history v4 replace-state-object', () => {
	it('should extract `state` object into the second argument', async () => {
		let input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push({ pathname: '/new-path', search: 'search', hash: 'hash', state: { key: 'value' } });
		`;

		let output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push({ pathname: '/new-path', search: 'search', hash: 'hash' }, { key: 'value' });
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});

	it('should do nothing if the argument is simply a string.', async () => {
		let input = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path');
		`;

		let output = `
		import createHistory from 'history/createBrowserHistory';

		const history = createHistory();
		
		history.push('/new-path');
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});
});
