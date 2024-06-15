import {
	Node,
	type PrefixUnaryExpression,
	type SourceFile,
	SyntaxKind,
	printNode,
	ts,
} from 'ts-morph';
import type { Options, Provider } from './types.js';
import {
	CODEMOD_LITERAL,
	type Literal,
	buildCodemodLiteral,
	getBlockText,
	getCodemodLiteralValue,
	getCodemodLiterals,
	getLiteralText,
	getPropertyValueAsText,
	isCodemodLiteral,
	isLiteral,
	isPrimitiveLiteral,
	isTruthy,
	repeatCallback,
} from './utils.js';

let simplifyAmpersandExpression = (left: Literal, right: Node) =>
	isTruthy(left) ? right : left;

let simplifyBarBarExpression = (left: Literal, right: Node) =>
	isTruthy(left) ? left : right;

/**
 * Simplifies logical expressions
 *
 *  true && x ===> true
 *  false && x ===> false
 */
let evaluateLogicalExpressions = (sourceFile: SourceFile) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.BinaryExpression)
		.forEach((be) => {
			if (be.wasForgotten()) {
				return;
			}

			let left = be.getLeft();
			let right = be.getRight();

			let unwrappedLeft = isCodemodLiteral(left)
				? getCodemodLiteralValue(left)
				: left;

			let unwrappedRight = isCodemodLiteral(right)
				? getCodemodLiteralValue(right)
				: right;

			if (!isLiteral(unwrappedLeft) || unwrappedRight === undefined) {
				return;
			}

			let op = be.getOperatorToken();

			if (op.getKind() === SyntaxKind.BarBarToken) {
				be.replaceWithText(
					simplifyBarBarExpression(
						unwrappedLeft,
						unwrappedRight,
					).getFullText(),
				);
			} else if (op.getKind() === SyntaxKind.AmpersandAmpersandToken) {
				be.replaceWithText(
					simplifyAmpersandExpression(
						unwrappedLeft,
						unwrappedRight,
					).getFullText(),
				);
			}
		});
};

let simplifyPrefixUnaryExpression = (pue: PrefixUnaryExpression) => {
	if (pue.wasForgotten()) {
		return;
	}

	let count = 1;
	let operand = pue.getOperand();

	while (
		Node.isPrefixUnaryExpression(operand) &&
		operand.compilerNode.operator === ts.SyntaxKind.ExclamationToken
	) {
		operand = operand.getOperand();
		count++;
	}

	let unwrapped = isCodemodLiteral(operand)
		? getCodemodLiteralValue(operand)
		: operand;

	if (!isLiteral(unwrapped)) {
		return;
	}

	let isSame = count % 2 === 0;
	let booleanValue = isSame ? isTruthy(unwrapped) : !isTruthy(unwrapped);
	let replacement = ts.factory.createLiteralTypeNode(
		booleanValue ? ts.factory.createTrue() : ts.factory.createFalse(),
	);

	pue.replaceWithText(printNode(replacement));
};

let getReplacementText = (
	provider: Provider,
	options: Options,
	name: string,
) => {
	return printNode(
		buildCodemodLiteral(
			provider.getReplacer(
				options.key,
				options.type,
				options.value,
				name,
			) as ts.Expression,
		),
	);
};

/**
 * Replaces Provider method calls with return value of the call
 * wraps the return value with __CODEMOD_LITERAL__ to distinguish it from other literals
 * useVariable(user, 'key', true) ===> __CODEMOD_LITERAL__({...})
 */
let replaceSDKMethodCalls = (
	sourceFile: SourceFile,
	options: Options,
	provider: Provider,
): boolean => {
	let matcher = provider.getMatcher(options.key);
	let replaced = false;

	sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((ce) => {
		let match = matcher(ce);

		if (match === null) {
			return;
		}

		let replacementText = getReplacementText(provider, options, match.name);
		let parent = ce.getParent();

		if (parent?.getKind() === SyntaxKind.ExpressionStatement) {
			replaced = true;

			parent.replaceWithText(replacementText);
			return;
		}

		ce.replaceWithText(replacementText);
		replaced = true;
	});

	return replaced;
};

/**
 * Simplifies property access on object literals with static properties
 *
 * {a: 1}.a ===> 1;
 *
 * {a: 1}['a'] ===> 1;
 */
let refactorMemberExpressions = (sourceFile: SourceFile) => {
	getCodemodLiterals(sourceFile).forEach((ce) => {
		let parent = ce.getParent();
		let ole = getCodemodLiteralValue(ce);

		if (!Node.isObjectLiteralExpression(ole)) {
			return;
		}

		if (Node.isPropertyAccessExpression(parent)) {
			let nameNode = parent.getNameNode();

			if (!Node.isIdentifier(nameNode)) {
				return;
			}

			let propertyName = nameNode.getText();

			// if property does not exists on the object, remove the whole statement
			if (ole.getProperty(propertyName) === undefined) {
				parent
					.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)
					?.remove();
				return;
			}

			let text = getPropertyValueAsText(ole, propertyName);

			if (text !== null) {
				parent.replaceWithText(`${CODEMOD_LITERAL}(${text})`);
			}
		}

		if (!parent?.wasForgotten() && Node.isElementAccessExpression(parent)) {
			let arg = parent.getArgumentExpression();

			if (!Node.isStringLiteral(arg)) {
				return;
			}

			let text = getPropertyValueAsText(ole, arg.getLiteralText());
			if (text !== null) {
				parent.replaceWithText(`${CODEMOD_LITERAL}(${text})`);
			}
		}
	});
};

/**
 * Finds variable assignments and replaces its references with variable value.
 * Removes variable declaration.
 *
 * const a = __CODEMOD_LITERAL__(true);
 *
 * if(a) {
 *   console.log(a);
 * }
 *
 * ===>
 *
 * if(__CODEMOD_LITERAL__(true)) {
 *   console.log(__CODEMOD_LITERAL__(true);)
 * }
 */
let refactorReferences = (sourceFile: SourceFile) => {
	getCodemodLiterals(sourceFile).forEach((ce) => {
		let vd = ce.getParent();

		if (!Node.isVariableDeclaration(vd)) {
			return;
		}

		let nameNode = vd.getNameNode();

		if (!Node.isIdentifier(nameNode)) {
			return;
		}

		let references = nameNode.findReferencesAsNodes();

		if (references.length === 0) {
			return;
		}

		nameNode.findReferencesAsNodes().forEach((ref) => {
			let replacer = getCodemodLiteralValue(ce);

			if (replacer === undefined) {
				return;
			}

			// we cannot directly replace shorthand property, e.g { a, b, c } with literal
			let parent = ref.getParent();

			if (Node.isShorthandPropertyAssignment(parent)) {
				let propertyAssignment = ts.factory.createPropertyAssignment(
					ts.factory.createIdentifier(ref.getText()),
					ts.factory.createNumericLiteral(
						`${CODEMOD_LITERAL}(${replacer.getFullText()})`,
					),
				);

				parent.replaceWithText(printNode(propertyAssignment));
				return;
			}

			// @TODO
			ref.replaceWithText(
				`${CODEMOD_LITERAL}(${replacer.getFullText()})`,
			);
		});

		vd.remove();
	});
};

/**
 * Simplifies prefix unary expression with exclamation token and literal
 *
 * !!!false ===> true
 * !!"string" ===> true
 */
let simplifyUnaryExpressions = (sourceFile: SourceFile) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.PrefixUnaryExpression)
		.filter((pue) => {
			return pue.compilerNode.operator === SyntaxKind.ExclamationToken;
		})
		.forEach(simplifyPrefixUnaryExpression);
};

/**
 * Replaces useless eqeqeq and eqeq binary expressions
 *
 * true === true ===> true
 *
 * true === false
 */
let evaluateBinaryExpressions = (sourceFile: SourceFile) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.BinaryExpression)
		.forEach((be) => {
			let left = be.getLeft();
			let right = be.getRight();

			let unwrappedLeft = isCodemodLiteral(left)
				? getCodemodLiteralValue(left)
				: left;
			let unwrappedRight = isCodemodLiteral(right)
				? getCodemodLiteralValue(right)
				: right;

			let op = be.getOperatorToken();

			// @TODO handle ==

			let isEqEqEq = op.getKind() === SyntaxKind.EqualsEqualsEqualsToken;

			if (
				isEqEqEq &&
				isPrimitiveLiteral(unwrappedLeft) &&
				isPrimitiveLiteral(unwrappedRight)
			) {
				be.replaceWithText(
					String(
						unwrappedLeft.getLiteralValue() ===
							unwrappedRight.getLiteralValue(),
					),
				);
				return;
			}

			// if one of left or right is object literal, === will never return true
			if (
				(isEqEqEq && Node.isObjectLiteralExpression(unwrappedLeft)) ||
				Node.isObjectLiteralExpression(unwrappedRight)
			) {
				be.replaceWithText('false');
			}
		});
};

let removeUselessParenthesis = (sourceFile: SourceFile) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.ParenthesizedExpression)
		.forEach((pe) => {
			if (pe.wasForgotten()) {
				return;
			}

			let expression = pe.getExpression();

			let unwrapped = isCodemodLiteral(expression)
				? getCodemodLiteralValue(expression)
				: expression;

			if (isLiteral(unwrapped)) {
				pe.replaceWithText(
					`${CODEMOD_LITERAL}(${getLiteralText(unwrapped)})`,
				);
			} else if (Node.isParenthesizedExpression(unwrapped)) {
				pe.replaceWithText(unwrapped.getFullText());
			}
		});
};

/**
 * Replaces if statements with single literal in condition.
 *
 * if(true) { x } ===> x
 * if(false) { x } ===> void
 */
let refactorIfStatements = (sourceFile: SourceFile) => {
	sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).forEach((ifs) => {
		let expression = ifs.getExpression();

		let unwrapped = isCodemodLiteral(expression)
			? getCodemodLiteralValue(expression)
			: expression;

		if (!isLiteral(unwrapped)) {
			return;
		}

		if (isTruthy(unwrapped)) {
			ifs.replaceWithText(getBlockText(ifs.getThenStatement()));
		} else {
			ifs.remove();
		}
	});
};

/**
 * Replaces conditional statements with single literal in condition
 *
 * const a = true ? x : y; ===> const a = x;
 */

let refactorConditionalExpressions = (sourceFile: SourceFile) => {
	sourceFile
		.getDescendantsOfKind(SyntaxKind.ConditionalExpression)
		.forEach((ce) => {
			let condition = ce.getCondition();

			let unwrapped = isCodemodLiteral(condition)
				? getCodemodLiteralValue(condition)
				: condition;

			if (!isLiteral(unwrapped)) {
				return;
			}

			if (isTruthy(unwrapped)) {
				ce.replaceWithText(ce.getWhenTrue().getText());
			} else {
				ce.replaceWithText(ce.getWhenFalse().getText());
			}
		});
};

/**
 * Removes codemod literal wrapper function
 *
 * __CODEMOD_LITERAL(true) ===> true
 */
let removeCodemodLiteralWrapper = (sourceFile: SourceFile) => {
	getCodemodLiterals(sourceFile).forEach((ce) => {
		if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
			ce
				.getParent()
				?.replaceWithText(
					getCodemodLiteralValue(ce)?.getFullText() ?? '',
				);
			return;
		}
		let literal = getCodemodLiteralValue(ce);

		let text =
			Node.isObjectLiteralExpression(literal) &&
			!Node.isVariableDeclaration(ce.getParent()) &&
			!Node.isCallExpression(ce.getParent())
				? `(${literal.getFullText()})`
				: literal?.getFullText() ?? '';

		ce.replaceWithText(text);
	});
};

export function handleSourceFile(
	sourceFile: SourceFile,
	options: Options,
): string | undefined {
	let { provider } = options;

	let replaced = replaceSDKMethodCalls(sourceFile, options, provider);

	if (!replaced) {
		return undefined;
	}

	repeatCallback(() => {
		refactorMemberExpressions(sourceFile);
		refactorReferences(sourceFile);
		simplifyUnaryExpressions(sourceFile);
		evaluateBinaryExpressions(sourceFile);
		evaluateLogicalExpressions(sourceFile);
		removeUselessParenthesis(sourceFile);
		refactorIfStatements(sourceFile);
		refactorConditionalExpressions(sourceFile);
	}, 5);

	removeCodemodLiteralWrapper(sourceFile);
	return sourceFile.getFullText();
}
