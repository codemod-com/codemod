import assert from 'node:assert/strict';
import { buildApi, trimLicense } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('history v4 use-back', () => {
	it('should replace history.goBack() with history.back()', async () => {
		let input = `
		history.goBack();

		const Component = () => {		  
			const handleChange = () => {
			  history.goBack();
			};

			useEffect(() => {
				history.goBack();
			}, []);
		  
			return (
			  <div>
				<Select
				  onChange={handleChange}
				/>
			  </div>
			);
		  };
		`;

		let output = `
		history.back();

		const Component = () => {		  
			const handleChange = () => {
			  history.back();
			};

			useEffect(() => {
				history.back();
			}, []);
		  
			return (
			  <div>
				<Select
				  onChange={handleChange}
				/>
			  </div>
			);
		  };
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
