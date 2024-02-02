import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router v4 wrap-with-imports', function () {
	it('should wrap Route components with Switch', async function () {
		const input = `
		import { Route, Router } from 'react-router-dom';

		const MyApp = () => (
			<Router history={history}>
				<Route path="/posts" component={PostList} />
				<Route path="/posts/:id" component={PostEdit} />
				<Route path="/posts/:id/show" component={PostShow} />
				<Route path="/posts/:id/delete" component={PostDelete} />
			</Router>
		);
		`;

		const output = `
		import { Route, Router } from 'react-router-dom';

		const MyApp = () => (
			<Router history={history}>
				<Switch>
					<Route path="/posts" component={PostList} />
					<Route path="/posts/:id" component={PostEdit} />
					<Route path="/posts/:id/show" component={PostShow} />
					<Route path="/posts/:id/delete" component={PostDelete} />
				</Switch>
			</Router>
		);
		`;

		const fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		const actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});
});
