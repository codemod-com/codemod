import { deepStrictEqual } from 'node:assert';
import { Project } from 'ts-morph';
import { describe, it } from 'vitest';
import { handleSourceFile } from '../src/index.js';

let transform = (
	beforeText: string,
	afterText: string,
	extension: '.js' | '.tsx',
) => {
	let project = new Project({
		useInMemoryFileSystem: true,
		skipFileDependencyResolution: true,
		compilerOptions: {
			allowJs: true,
		},
	});

	let actualSourceFile = project.createSourceFile(
		`actual${extension}`,
		beforeText,
	);
	let actual = handleSourceFile(actualSourceFile);

	let expected = project
		.createSourceFile(`expected${extension}`, afterText)
		.getFullText();

	return {
		actual,
		expected,
	};
};

describe('next 13 upsert-client-directive', () => {
	it('should not rewrite the file', () => {
		let beforeText = `
            'use client';

            export default function Page() {
                return null;
            }
		`;

		let { actual } = transform(beforeText, beforeText, '.tsx');
		deepStrictEqual(actual, undefined);
	});

	it("should upsert the 'use client' directive when React hooks are used", () => {
		let beforeText = `
            import { useState } from 'react';

            export default function Page() {
                const [x, setX] = useState('');

                return x;
            }
		`;

		let afterText = `'use client';

            import { useState } from 'react';

            export default function Page() {
                const [x, setX] = useState('');

                return x;
            }
		`;

		let { actual, expected } = transform(beforeText, afterText, '.tsx');
		deepStrictEqual(actual, expected);
	});

	it("should not upsert the 'use client' directive when fetch is used", () => {
		let beforeText = `
            export default async function Page() {
                return fetch('http://example.com);
            }
		`;

		let { actual } = transform(beforeText, beforeText, '.tsx');
		deepStrictEqual(actual, undefined);
	});

	it("should not upsert the 'use client' directive when fetch is used", () => {
		let beforeText = `
            export default async function Page() {
                return fetch('http://example.com);
            }
		`;

		let { actual } = transform(beforeText, beforeText, '.tsx');
		deepStrictEqual(actual, undefined);
	});

	it("should upsert the 'use client' directive when an event handler is used", () => {
		let beforeText = `
            export default async function Page() {
                return <div onClick={null}>
                    TEST
                </div>;
            }
		`;

		let afterText = `'use client';

            export default async function Page() {
                return <div onClick={null}>
                    TEST
                </div>;
            }
		`;

		let { actual, expected } = transform(beforeText, afterText, '.tsx');
		deepStrictEqual(actual, expected);
	});
});
