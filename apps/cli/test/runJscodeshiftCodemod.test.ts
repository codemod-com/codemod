import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'vitest';
import { transpile } from '../src/getTransformer.js';
import { runJscodeshiftCodemod } from '../src/runJscodeshiftCodemod.js';
import type { ConsoleKind } from '../src/schemata/consoleKindSchema.js';

const codemodSource = transpile(`
import type { FileInfo, API, Options } from 'jscodeshift';

// this is the entry point for a JSCodeshift codemod
export default function transform(
    file: FileInfo,
    api: API,
    options: Options,
): string | undefined {
    console.log(file.path);

    const j = api.jscodeshift;
    const root = j(file.source);

    root.find(j.FunctionDeclaration, {
        id: {
            name: 'mapStateToProps',
            type: 'Identifier',
        },
    }).forEach((functionDeclarationPath) => {
        if (functionDeclarationPath.value.params.length === 0) {
            return;
        }

        const collection = j(functionDeclarationPath);
        collection.forEach((astPath) => {
            const patternKind = astPath.value.params[0];
            if (patternKind?.type !== 'Identifier') {
                return;
            }
            const identifierPathCollection = j(astPath).find(j.Identifier, {
                name: patternKind.name,
            });
            const typeAnnotation = j.typeAnnotation(
                j.genericTypeAnnotation(j.identifier('State'), null),
            );

            identifierPathCollection.paths()[0]?.replace(
                j.identifier.from({
                    comments: patternKind.comments ?? null,
                    name: patternKind.name,
                    optional: patternKind.optional,
                    typeAnnotation: typeAnnotation,
                }),
            );
        });
    });

    return root.toSource();
}
`);

describe('runJscodeshiftCodemod', () => {
	it('should return transformed output', () => {
		const messages: [ConsoleKind, string][] = [];

		const oldData = `function mapStateToProps(state) {}`;

		const fileCommands = runJscodeshiftCodemod(
			codemodSource,
			'/index.ts',
			oldData,
			true,
			[{}],
			(consoleKind, message) => {
				messages.push([consoleKind, message]);
			},
		);

		deepStrictEqual(fileCommands.length, 1);

		const [fileCommand] = fileCommands;

		const newData = `function mapStateToProps(state: State) {}`;

		deepStrictEqual(fileCommand, {
			kind: 'updateFile',
			oldPath: '/index.ts',
			oldData,
			newData,
			formatWithPrettier: true,
		});

		deepStrictEqual(messages, [['log', '/index.ts']]);
	});
});
