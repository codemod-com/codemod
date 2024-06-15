import type { SourceFile } from 'ts-morph';
import { type CallExpression, Node, ts } from 'ts-morph';

import { handleSourceFile as handleSourceFileCore } from '../../../replace-feature-flag-core/src/index.js';
import type {
	Options,
	Provider,
	VariableType,
	VariableValue,
} from '../../../replace-feature-flag-core/src/types.js';

import {
	buildLiteral,
	getCEExpressionName,
} from '../../../replace-feature-flag-core/src/utils.js';

let { factory } = ts;

let names = ['checkGate', 'useGate'];

let getVariableReplacerNode = (
	_: string,
	type: VariableType,
	value: VariableValue,
) => {
	return factory.createObjectLiteralExpression(
		[
			factory.createPropertyAssignment(
				factory.createIdentifier('isLoading'),
				factory.createFalse(),
			),
			factory.createPropertyAssignment(
				factory.createIdentifier('value'),
				buildLiteral(type, value),
			),
		],
		true,
	);
};

let getVariableValueReplacerNode = (
	key: string,
	type: VariableType,
	value: VariableValue,
) => {
	return buildLiteral(type, value);
};

type MatchedMethod = {
	name: string;
};

export let provider: Provider = {
	getMatcher:
		(keyName: string) =>
		(ce: CallExpression): MatchedMethod | null => {
			let name = getCEExpressionName(ce);

			if (name === null || !names.includes(name)) {
				return null;
			}

			let args = ce.getArguments();
			let keyArg = args.at(0);

			if (
				Node.isStringLiteral(keyArg) &&
				keyArg.getLiteralText() === keyName
			) {
				return { name };
			}

			return null;
		},
	getReplacer: (
		key: string,
		type: VariableType,
		value: VariableValue,
		name: string,
	) => {
		let node =
			name === 'checkGate'
				? getVariableValueReplacerNode(key, type, value)
				: getVariableReplacerNode(key, type, value);

		return node;
	},
};

export function handleSourceFile(
	sourceFile: SourceFile,
	options: Omit<Options, 'provider'>,
): string | undefined {
	return handleSourceFileCore(sourceFile, { ...options, provider: provider });
}
