import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('react-router v4 replace-param-prop', () => {
	it('should replace "params" prop with "match.params" ', async () => {
		let input = `
		const PostEdit = ({ params }) => {
			return <div>
				<h1>Post {params.id}</h1>
			</div>
		}
		`;

		let output = `
		const PostEdit = ({ match }) => {
			const { params } = match;
			return <div>
				<h1>Post {params.id}</h1>
			</div>
		}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});

	it('should replace "params" prop with "match.params" in mapStateToProps', async () => {
		let input = `
		const PostEdit = () => {
			return null;
		}

		const mapStateToProps = (state, { params }) => {

			return {
				a: params.a
			}
		}

		`;

		let output = `
		const PostEdit = () => {
			return null;
		}

		const mapStateToProps = (state, { match }) => {
			const { params } = match;
			return {
				a: params.a
			}
		}
		`;

		let fileInfo: FileInfo = {
			path: 'index.js',
			source: input,
		};

		let actualOutput = transform(fileInfo, buildApi('js'), {
			quote: 'single',
		});

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			output.replace(/\W/gm, ''),
		);
	});
});
