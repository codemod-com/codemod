import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('mocha/vitest test', function () {
	it('when `expect` for `chai` is being imported', function () {
		const INPUT = `
        import { expect } from 'chai';

        describe('Test Suite 1', () => {
          it('addition', () => {
            expect(1 + 1).to.equal(2);
          });
        });
        
        describe('Test Suite 2', () => {
          it('subtraction', () => {
            expect(1 - 1).to.equal(0);
          });
        });
        `;

		const OUTPUT = `
        import { expect, describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          it('addition', () => {
            expect(1 + 1).to.equal(2);
          });
        });
        
        describe('Test Suite 2', () => {
          it('subtraction', () => {
            expect(1 - 1).to.equal(0);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('when `chai` is not used', function () {
		const INPUT = `
        describe('Test Suite 1', () => {
          it('addition', () => {
            assert(1 + 1 == 2);
          });
        });
        
        describe('Test Suite 2', () => {
          it('subtraction', () => {
            assert(1 - 1 == 0);
          });
        });
        `;

		const OUTPUT = `
        import { describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          it('addition', () => {
            assert(1 + 1 == 2);
          });
        });
        
        describe('Test Suite 2', () => {
          it('subtraction', () => {
            assert(1 - 1 == 0);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('should keep the preceding comments', function () {
		const INPUT = `
        // preceding comments
        import { expect } from 'chai';

        describe('Test Suite 1', () => {
          it('addition', () => {
            expect(1 + 1).to.equal(2);
          });
        });
        `;

		const OUTPUT = `
      // preceding comments
        import { expect, describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          it('addition', () => {
            expect(1 + 1).to.equal(2);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('when beforeEach or afterAll are used', function () {
		const INPUT = `
        describe('Test Suite 1', () => {
          beforeEach(() => {
            doAThing();
          });

          it('addition', () => {
            assert(1 + 1 == 2);
          });

          it('subtraction', () => {
            assert(1 - 1 == 0);
          });

          afterAll(() => {
            doAThing();
          });
        });
        `;

		const OUTPUT = `
        import { afterAll, beforeEach, describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          beforeEach(() => {
            doAThing();
          });

          it('addition', () => {
            assert(1 + 1 == 2);
          });

          it('subtraction', () => {
            assert(1 - 1 == 0);
          });

          afterAll(() => {
            doAThing();
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	// Also removes this: Context entirely, but
	it('when there are imports from mocha', function () {
		const INPUT = `
        import type { Context } from 'mocha';

        describe('Test Suite 1', () => {
          it('addition', function (this: Context) {
            assert(1 + 1 == 2);
          });

          it('subtraction', (otherThing: Context) => {
            assert(1 - 1 == 0);
          });
        });
        `;

		const OUTPUT = `
        import { describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          it('addition', function () {
            assert(1 + 1 == 2);
          });

          it('subtraction', (otherThing) => {
            assert(1 - 1 == 0);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});

	it('when there are imports from vitest', function () {
		const INPUT = `
        import { describe, it } from 'vitest';

        describe('Test Suite 1', () => {
          it('addition', function (this: Context) {
            assert(1 + 1 == 2);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(actualOutput, undefined);
	});

	it('when there is a named import: test', function () {
		const INPUT = `
        import { test } from "../lib/fixtures";
        describe('Test Suite 1', () => {
          it('addition', function (this: Context) {
            assert(1 + 1 == 2);
          });
        });
        `;

		const OUTPUT = `
        import { test } from "../lib/fixtures";
        import { describe, it } from 'vitest';
        describe('Test Suite 1', () => {
          it('addition', function (this: Context) {
            assert(1 + 1 == 2);
          });
        });
        `;

		const fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		const actualOutput = transform(fileInfo, buildApi('tsx'));

		assert.deepEqual(
			actualOutput?.replace(/\W/gm, ''),
			OUTPUT.replace(/\W/gm, ''),
		);
	});
});
