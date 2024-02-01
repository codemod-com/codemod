import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router v4 replace-param-prop', function () {
	it('should replace "params" prop with "match.params" ', async function () {
		const input = `
		const PostEdit = ({ params }) => (
			<div>
				<h1>Post {params.id}</h1>
			</div>
		)
		`;

		const output = `
		const PostEdit = ({ match }) => (
			<div>
				<h1>Post {match.params.id}</h1>
			</div>
		)
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
