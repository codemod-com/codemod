import type { SourceFile } from 'ts-morph';
import { type CallExpression, Node } from 'ts-morph';

import { handleSourceFile as handleSourceFileCore } from '../../../replace-feature-flag-core/src/index.js';
import type {
	Options,
	Provider,
	VariableType,
	VariableValue,
} from '../../../replace-feature-flag-core/src/types.js';

// @TODO move core to the package
import {
	buildLiteral,
	getCEExpressionName,
} from '../../../replace-feature-flag-core/src/utils.js';

let names = [
	'getBooleanValue',
	'getStringValue',
	'getNumberValue',
	'getObjectValue',
];

let getVariableValueReplacerNode = (
	_: string,
	type: VariableType,
	value: VariableValue,
) => {
	return buildLiteral(type, value);
};

type MatchedMethod = {
	name: string;
};

let methodToTypeMap: Record<string, VariableType> = {
	getBooleanValue: 'boolean',
	getStringValue: 'string',
	getNumberValue: 'number',
	getObjectValue: 'JSON',
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
		_: VariableType,
		value: VariableValue,
		name: string,
	) => {
		let type = methodToTypeMap[name];

		if (type === undefined) {
			return null;
		}

		return getVariableValueReplacerNode(key, type, value);
	},
};

export function handleSourceFile(
	sourceFile: SourceFile,
	options: Omit<Options, 'provider'>,
): string | undefined {
	return handleSourceFileCore(sourceFile, { ...options, provider: provider });
}
