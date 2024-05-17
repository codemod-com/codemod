import { type SourceFile, SyntaxKind } from 'ts-morph';

export let handleSourceFile = (sourceFile: SourceFile): string | undefined => {
	let text =
		sourceFile
			.getStatements()[0]
			?.asKind(SyntaxKind.ExpressionStatement)
			?.getExpressionIfKind(SyntaxKind.StringLiteral)?.compilerNode
			.text ?? null;

	if (text === 'use client') {
		return undefined;
	}

	let SERVER_IDENTIFIERS = ['fetch', 'trpc'];

	let serverIdentifierPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some(({ compilerNode }) =>
			SERVER_IDENTIFIERS.includes(compilerNode.text),
		);

	if (serverIdentifierPresent) {
		return undefined;
	}

	let REACT_HOOK_NAMES = [
		'useCallback',
		'useContext',
		'useDebugValue',
		'useDeferredValue',
		'useEffect',
		'useId',
		'useImperativeHandle',
		'useInsertionEffect',
		'useLayoutEffect',
		'useMemo',
		'useReducer',
		'useReft',
		'useState',
		'useSyncExternalStore',
		'useTransition',
	];

	let reactIdentifiersPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some(({ compilerNode }) =>
			REACT_HOOK_NAMES.includes(compilerNode.text),
		);

	let reactLiteralsPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.StringLiteral)
		.some(({ compilerNode }) => compilerNode.text === 'react');

	let eventHandlerIdentifiersPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some(({ compilerNode }) => /^on[A-Z]/.test(compilerNode.text));

	if (
		(reactIdentifiersPresent && reactLiteralsPresent) ||
		eventHandlerIdentifiersPresent
	) {
		sourceFile.insertStatements(0, `'use client';`);
	}

	return sourceFile.getFullText();
};
