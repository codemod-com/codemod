import { SyntaxKind, type SourceFile } from 'ts-morph';

export const handleSourceFile = (
	sourceFile: SourceFile,
): string | undefined => {
	const text =
		sourceFile
			.getStatements()[0]
			?.asKind(SyntaxKind.ExpressionStatement)
			?.getExpressionIfKind(SyntaxKind.StringLiteral)?.compilerNode
			.text ?? null;

	if (text === 'use client') {
		return undefined;
	}

	const SERVER_IDENTIFIERS = ['fetch', 'trpc'];

	const serverIdentifierPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some(({ compilerNode }) =>
			SERVER_IDENTIFIERS.includes(compilerNode.text),
		);

	if (serverIdentifierPresent) {
		return undefined;
	}

	const REACT_HOOK_NAMES = [
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

	const reactIdentifiersPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.Identifier)
		.some(({ compilerNode }) =>
			REACT_HOOK_NAMES.includes(compilerNode.text),
		);

	const reactLiteralsPresent = sourceFile
		.getDescendantsOfKind(SyntaxKind.StringLiteral)
		.some(({ compilerNode }) => compilerNode.text === 'react');

	const eventHandlerIdentifiersPresent = sourceFile
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
