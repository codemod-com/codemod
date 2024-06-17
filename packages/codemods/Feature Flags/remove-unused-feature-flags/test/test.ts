import assert from 'node:assert';
import { buildApi } from '@codemod-com/utilities';
import type { FileInfo } from 'jscodeshift';
import { describe, it } from 'vitest';
import transform from '../src/index.js';

describe('remove-unused-feature-flags', () => {
	it('should not change code without feature flags', () => {
		let INPUT = `
        const Component = () => {
			return <div>A</div>;
		}
		`;

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(actualOutput, undefined);
	});

	it('should remove a feature flag check within Promise.all()', () => {
		let INPUT = `
        const [a, b] = await Promise.all([
            Promise.resolve('a'),
            isFlagEnabled('featureFlag'),
        ]);

		const x = b && c;

		const y = <A b={b} />
		`;

		let OUTPUT = `
        const a = await Promise.resolve('a');

		const x = c;

		const y = <A b={true} />
        `;

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('tsx'), {});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it('should remove a feature flag check within Promise.all() (with options)', () => {
		let INPUT = `
        const [b, a] = await Promise.all([
			fnc('b'),
            Promise.resolve('a'),
        ]);

		const d = () => {
			return c() && b;
		}
		`;

		let OUTPUT = `
        const a = await Promise.resolve('a');

		const d = () => {
			return c();
		}
        `;

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {
			functionName: 'fnc',
			featureFlagName: 'b',
		});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});

	it("should replace await isFlagEnabled('featureFlag') with true", () => {
		let INPUT = `const a = await isFlagEnabled('featureFlag');`;

		let OUTPUT = 'const a = true;';

		let fileInfo: FileInfo = {
			path: 'index.ts',
			source: INPUT,
		};

		let actualOutput = transform(fileInfo, buildApi('ts'), {});

		assert.deepEqual(
			actualOutput?.replace(/\s/gm, ''),
			OUTPUT.replace(/\s/gm, ''),
		);
	});
});
