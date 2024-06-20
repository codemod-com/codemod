import {
	type CallExpression,
	type FalseLiteral,
	Node,
	type NumericLiteral,
	type ObjectLiteralExpression,
	type SourceFile,
	type Statement,
	type StringLiteral,
	SyntaxKind,
	type TrueLiteral,
	ts,
} from 'ts-morph';
import type { VariableType, VariableValue } from './types.js';

let { factory } = ts;

export let CODEMOD_LITERAL = '__CODEMOD_LITERAL__';

export let getCEExpressionName = (ce: CallExpression): string | null => {
	let expr = ce.getExpression();

	// x.method()
	if (Node.isPropertyAccessExpression(expr)) {
		return expr.getName();
	}

	// method()
	if (Node.isIdentifier(expr)) {
		return expr.getText();
	}

	return null;
};
export let buildLiteral = (type: VariableType, value: VariableValue) => {
	switch (type) {
		case 'string': {
			return factory.createStringLiteral(value.toString());
		}
		case 'number': {
			return factory.createNumericLiteral(Number(value));
		}
		case 'boolean': {
			return value === 'true'
				? factory.createTrue()
				: factory.createFalse();
		}
		case 'JSON': {
			return buildJSON(
				typeof value === 'string' ? value : JSON.stringify(value),
			);
		}
		case 'null': {
			return factory.createNull();
		}
	}
};

export type PrimitiveLiteral =
	| StringLiteral
	| NumericLiteral
	| TrueLiteral
	| FalseLiteral;

export type Literal = PrimitiveLiteral | ObjectLiteralExpression;

export let isLiteral = (node: Node | undefined): node is Literal =>
	isPrimitiveLiteral(node) || Node.isObjectLiteralExpression(node);

export let isPrimitiveLiteral = (
	node: Node | undefined,
): node is PrimitiveLiteral =>
	Node.isStringLiteral(node) ||
	Node.isNumericLiteral(node) ||
	Node.isTrueLiteral(node) ||
	Node.isFalseLiteral(node);

export let getLiteralText = (node: Literal) =>
	Node.isObjectLiteralExpression(node)
		? node.getFullText()
		: String(node.getLiteralValue());

export let isCodemodLiteral = (node: Node): node is CallExpression => {
	return (
		Node.isCallExpression(node) &&
		node.getExpression().getText() === CODEMOD_LITERAL
	);
};

export let isTruthy = (node: Literal) => {
	return 'getLiteralValue' in node ? Boolean(node.getLiteralValue()) : true;
};

export let repeatCallback = (
	callback: (abort: () => void) => void,
	N: number,
): void => {
	if (typeof callback !== 'function') {
		throw new TypeError('The first argument must be a function');
	}

	if (typeof N !== 'number' || N < 0 || !Number.isInteger(N)) {
		throw new TypeError(
			'The second argument must be a non-negative integer',
		);
	}

	let shouldContinue = true;
	let i = 0;

	let abort = () => {
		shouldContinue = false;
	};

	while (i < N && shouldContinue) {
		callback(abort);
		i++;
	}
};
export let getCodemodLiterals = (sourceFile: SourceFile) => {
	return sourceFile
		.getDescendantsOfKind(SyntaxKind.CallExpression)
		.filter((ce) => ce.getExpression().getText() === CODEMOD_LITERAL);
};

export let getBlockText = (node: Statement) => {
	let fullText = node.getFullText();

	let idx1 = fullText.indexOf('{');
	let idx2 = fullText.lastIndexOf('}');

	return fullText.slice(idx1 + 1, idx2);
};

export let buildCodemodLiteral = (node: ts.Expression) => {
	return ts.factory.createCallExpression(
		ts.factory.createIdentifier(CODEMOD_LITERAL),
		undefined,
		[node],
	);
};
export let getCodemodLiteralValue = (node: CallExpression) => {
	return node.getArguments().at(0);
};
export let getPropertyValueAsText = (
	ole: ObjectLiteralExpression,
	propertyName: string,
) => {
	if (ole.wasForgotten()) {
		return;
	}

	let property = ole.getProperty(propertyName);

	if (!Node.isPropertyAssignment(property)) {
		return null;
	}

	let propertyValue = property.getInitializer();

	// @TODO
	if (
		!Node.isStringLiteral(propertyValue) &&
		!Node.isNumericLiteral(propertyValue) &&
		!Node.isTrueLiteral(propertyValue) &&
		!Node.isFalseLiteral(propertyValue) &&
		!Node.isObjectLiteralExpression(propertyValue)
	) {
		return null;
	}

	return propertyValue.getFullText();
};

export let buildJSON = (json: string): ts.ObjectLiteralExpression => {
	let object = JSON.parse(json);
	let factory = ts.factory;

	let properties = Object.entries(object).map(([key, value]) => {
		let type =
			typeof value === 'object' && value !== null
				? 'JSON'
				: value === null
					? 'null'
					: typeof value;

		return factory.createPropertyAssignment(
			factory.createIdentifier(key),
			// @ts-expect-error expecting only string number or boolean after parsing json
			buildLiteral(type, value),
		);
	});

	return factory.createObjectLiteralExpression(properties, true);
};
