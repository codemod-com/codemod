import assert from 'node:assert/strict';
import { buildApi, trimLicense } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router v4 browser-router', () => {
	it('should replace Router component with BrowserRouter, add BrowserRouter import', async () => {
		let input = `
		import { Router, browserHistory } from 'react-router';
		const MyApp = () => (
		<Router history={browserHistory}>
			<Route path="/home" component={Home} />
		</Router>
		);
		`;

		let output = `
		import { BrowserRouter } from 'react-router-dom';
		import { Router, browserHistory } from 'react-router';
		const MyApp = () => (
		<BrowserRouter>
			<Route path="/home" component={Home} />
		</BrowserRouter>
		);
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
