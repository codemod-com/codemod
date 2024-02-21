/* eslint-disable import/group-exports */
import { inflate } from "pako";
import { decode } from "universal-base64url";
import { parseShareableCodemod } from "~/schemata/shareableCodemodSchemata";
import { parseState } from "~/schemata/stateSchemata";
import { isNeitherNullNorUndefined } from "~/utils/isNeitherNullNorUndefined";
import { prettify } from "~/utils/prettify";

export const BEFORE_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state) {
    const { data } = state;
    return {
        data,
    };
}
 `;

export const AFTER_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state: State) {
    const { data } = state;
    return {
        data,
    };
}
`;

export const DEFAULT_FIND_REPLACE_EXPRESSION = `
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
});`;

export const STARTER_SNIPPET = `// HERE'S A SAMPLE CODEMOD.

// CLICK THE 'CLEAR ALL' BUTTON ABOVE TO START FRESH & REMOVE ALL SAMPLE INPUTS.

// PROVIDE BEFORE/AFTER CODE SNIPPETS, WHICH SERVE AS YOUR TEST FIXTURES.

// CREATE A NEW CODEMOD USING MODGPT OR THE GUI CODEMOD BUILDER.


import type { FileInfo, API, Options } from 'jscodeshift';

export default function transform(
    file: FileInfo,
    api: API,
		options?: Options,
): string | undefined {
    const j = api.jscodeshift;
    const root = j(file.source);
    {%DEFAULT_FIND_REPLACE_EXPRESSION%}
	{%COMMENT%}
    return root.toSource();
};`;

export const TSMORPH_STARTER_SNIPPET = `
import { SourceFile, EmitHint } from "ts-morph";

export const handleSourceFile = (
	sourceFile: SourceFile
): string | undefined => {
	return sourceFile.print({ emitHint: EmitHint.SourceFile });
}
`;

export const buildDefaultCodemodSource = (
	engine: 'jscodeshift' | 'tsmorph',
) => {
	if (engine === "jscodeshift") {
		return prettify(
			STARTER_SNIPPET.replace(
				'{%DEFAULT_FIND_REPLACE_EXPRESSION%}',
				DEFAULT_FIND_REPLACE_EXPRESSION,
			).replace('{%COMMENT%}', ''),
		);
	}

	return TSMORPH_STARTER_SNIPPET;
};

/* eslint-disable import/group-exports */
export const SEARCH_PARAMS_KEYS = Object.freeze({
	ENGINE: 'engine' as const,
	BEFORE_SNIPPET: 'beforeSnippet' as const,
	AFTER_SNIPPET: 'afterSnippet' as const,
	CODEMOD_SOURCE: 'codemodSource' as const,
	CODEMOD_NAME: 'codemodName' as const,
	COMMAND: 'command' as const,
	COMPRESSED_SHAREABLE_CODEMOD: 'c' as const,
	ACCESS_TOKEN: 'accessToken' as const,
});

type InitialState = Readonly<{
	engine: 'jscodeshift' | 'tsmorph';
	beforeSnippet: string;
	afterSnippet: string;
	codemodSource: string;
	codemodName: string | null;
	command:
		| 'learn'
		| 'accessTokenRequested'
		| 'accessTokenRequestedByCLI'
		| 'accessTokenRequestedByVSCE'
		| null;
}>;

export const getInitialState = (): InitialState => {
	{
		if (typeof window === 'undefined') {
			return {
				engine: 'jscodeshift',
				beforeSnippet: '',
				afterSnippet: '',
				codemodSource: '',
				codemodName: '',
				command: null,
			};
		}

		const searchParams = new URLSearchParams(window.location.search);

		const decodeNullable = (value: string | null): string | null => {
			if (value === null) {
				return value;
			}

			return decode(value);
		};

		const csc = searchParams.get(
			SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD,
		);

		if (csc !== null) {
			try {
				const encryptedString = window.atob(
					csc.replaceAll('-', '+').replaceAll('_', '/'),
				);

				const numberArray = Array.from(encryptedString)
					.map((character) => character.codePointAt(0))
					.filter(isNeitherNullNorUndefined);

				const uint8Array = Uint8Array.from(numberArray);

				const decryptedString = inflate(uint8Array, { to: 'string' });

				const shareableCodemod = parseShareableCodemod(
					JSON.parse(decryptedString),
				);

				return {
					engine: shareableCodemod.e ?? 'jscodeshift',
					beforeSnippet: shareableCodemod.b ?? '',
					afterSnippet: shareableCodemod.a ?? '',
					codemodSource: shareableCodemod.c ?? '',
					codemodName: shareableCodemod.n ?? null,
					command: null,
				};
			} catch (error) {
				console.error(error);
			}
		}

		const engine = decodeNullable(
			searchParams.get(SEARCH_PARAMS_KEYS.ENGINE),
		);
		const beforeSnippet = decodeNullable(
			searchParams.get(SEARCH_PARAMS_KEYS.BEFORE_SNIPPET),
		);
		const afterSnippet = decodeNullable(
			searchParams.get(SEARCH_PARAMS_KEYS.AFTER_SNIPPET),
		);
		const codemodSource = decodeNullable(
			searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_SOURCE),
		);
		const codemodName = decodeNullable(
			searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_NAME),
		);

		const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

		const someSearchParamsSet = [
			engine,
			beforeSnippet,
			afterSnippet,
			codemodSource,
			codemodName,
			command,
		].some((s) => s !== null);

		if (someSearchParamsSet) {
			const parsedEngine: 'jscodeshift' | 'tsmorph' =
				engine === 'jscodeshift' || engine === 'tsmorph'
					? engine
					: ('jscodeshift' as const);

			return {
				engine: parsedEngine,
				beforeSnippet: beforeSnippet ?? '',
				afterSnippet: afterSnippet ?? '',
				codemodSource: codemodSource ?? '',
				codemodName: codemodName ?? '',
				command:
					command === 'learn' || command === 'accessTokenRequested'
						? command
						: null,
			};
		}
	}

	const stringifiedState = localStorage.getItem('state');

	if (stringifiedState !== null) {
		try {
			const state = parseState(JSON.parse(stringifiedState));

			const everyValueIsEmpty = [
				state.afterSnippet,
				state.beforeSnippet,
				state.codemodSource,
			].every((s) => s === '');

			const beforeSnippet = everyValueIsEmpty
				? BEFORE_SNIPPET_DEFAULT_CODE
				: state.beforeSnippet;

			const afterSnippet = everyValueIsEmpty
				? AFTER_SNIPPET_DEFAULT_CODE
				: state.afterSnippet;

			const codemodSource = everyValueIsEmpty
				? buildDefaultCodemodSource(state.engine)
				: state.codemodSource;

			return {
				engine: state.engine,
				beforeSnippet,
				afterSnippet,
				codemodSource,
				codemodName: null,
				command: null,
			};
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error(error);
		}
	}

	return {
		engine: 'jscodeshift' as const,
		beforeSnippet: BEFORE_SNIPPET_DEFAULT_CODE,
		afterSnippet: AFTER_SNIPPET_DEFAULT_CODE,
		codemodSource: buildDefaultCodemodSource('jscodeshift'),
		codemodName: null,
		command: null,
	};
};

// I don't like this being a global variable
// TODO pass this as a dependency when initializing redux
export const INITIAL_STATE = getInitialState();
