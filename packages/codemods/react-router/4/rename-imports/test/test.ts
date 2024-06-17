import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router v4 rename-imports', () => {
	it('should replace "react-router" import with "react-router-dom"', async () => {
		let input = `import { Redirect, Route } from 'react-router';`;

		let output = `import { Redirect, Route } from 'react-router-dom';`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});

	it('example 1 from netlify-react-ui', async () => {
		let input = `import { browserHistory } from 'react-router';`;

		let output = `import { browserHistory } from 'react-router-dom';`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});

	it('example 2 from netlify-react-ui', async () => {
		let input = `import type { WithRouterProps } from 'react-router';`;

		let output = `import type { WithRouterProps } from 'react-router-dom';`;

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});

	it('example 3 from netlify-react-ui', async () => {
		let input = `import { createMemoryHistory, Route, Router } from 'react-router';`;

		let output = `import { createMemoryHistory, Route, Router } from 'react-router-dom';`;

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});
});
