import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router 4 replace-location-query', function () {
	it('basic', function () {
		const INPUT = `
			const PostList = ({ location }) => (
				<div>
					<h1>List sorted by {location.query.sort}</h1>
				</div>
			);
        `;

		const OUTPUT = `
			import { parse } from 'query-string';
			const PostList = ({ location }) => (
				<div>
					<h1>List sorted by {parse(location.search).sort}</h1>
				</div>
			);
        `;

		const fileInfo: FileInfo = {
			path: 'index.js',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
