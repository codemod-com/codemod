import assert from 'node:assert/strict';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import sinon from 'sinon';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

let INPUT = `
export default () => (
    <div>
      <p>only this paragraph will get the style :)</p>
          <SomeComponent />
      
        <style jsx>{\`
         p {
          color: red;
         }
        \`}</style>
    </div>
)`;

let OUTPUT = `
import styles from "./index.module.css";

export default () => (
  <div className={styles.wrapper}>
    <p>only this paragraph will get the style :)</p>
        <SomeComponent />
  </div>
)
`;

let STYLE_FILE = '\n         p {\n          color: red;\n         }\n        ';

describe('next 13 move-css-in-js-styles', () => {
	it('should remove the style component, add an import and a class name', async () => {
		let fileInfo: FileInfo = {
			path: '/opt/repository/pages/index.js',
			source: INPUT,
		};

		let options = {
			createFile(path: string, data: string) {
				return { path, data };
			},
		};

		let spy = sinon.spy(options);

		let actualOutput = transform(fileInfo, buildApi('js'), options);

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);

		assert.deepEqual(
			spy.createFile.calledOnceWith(
				'/opt/repository/pages/index.module.css',
				STYLE_FILE,
			),
			true,
		);
	});
});
