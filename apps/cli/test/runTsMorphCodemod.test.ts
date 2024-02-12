import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'vitest';
import { transpile } from '../src/getTransformer.js';
import { runTsMorphCodemod } from '../src/runTsMorphCodemod.js';
import type { ConsoleKind } from '../src/schemata/consoleKindSchema.js';

const codemodSource = transpile(`
import { SourceFile, EmitHint } from 'ts-morph';

export const handleSourceFile = (
    sourceFile: SourceFile,
): string | undefined => {
	console.log(sourceFile.getFilePath())

    sourceFile.addClass({
        name: 'Test'
    })

    return sourceFile.print({ emitHint: EmitHint.SourceFile });
};
`);

describe('runTsMorphCodemod', () => {
	it('should return transformed output', () => {
		const messages: [ConsoleKind, string][] = [];

		const fileCommands = runTsMorphCodemod(
			codemodSource,
			'index.ts',
			``,
			true,
			[{}],
			(consoleKind, message) => {
				messages.push([consoleKind, message]);
			},
		);

		deepStrictEqual(fileCommands.length, 1);

		const [fileCommand] = fileCommands;

		deepStrictEqual(fileCommand, {
			kind: 'updateFile',
			oldPath: 'index.ts',
			oldData: '',
			newData: 'class Test {\n}\n',
			formatWithPrettier: true,
		});

		deepStrictEqual(messages, [['log', '/index.ts']]);
	});
});
