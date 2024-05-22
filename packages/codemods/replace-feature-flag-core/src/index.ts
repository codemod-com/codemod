import {
  Node,
  type PrefixUnaryExpression,
  type SourceFile,
  SyntaxKind,
  printNode,
  ts,
} from "ts-morph";
import type { Options, Provider } from "./types.js";
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
} from "./utils.js";

const simplifyAmpersandExpression = (left: Literal, right: Node) =>
  isTruthy(left) ? right : left;

const simplifyBarBarExpression = (left: Literal, right: Node) =>
  isTruthy(left) ? left : right;

/**
 * Simplifies logical expressions
 *
 *  true && x ===> true
 *  false && x ===> false
 */
const evaluateLogicalExpressions = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((be) => {
    if (be.wasForgotten()) {
      return;
    }

    const left = be.getLeft();
    const right = be.getRight();

    const unwrappedLeft = isCodemodLiteral(left)
      ? getCodemodLiteralValue(left)
      : left;

    const unwrappedRight = isCodemodLiteral(right)
      ? getCodemodLiteralValue(right)
      : right;

    if (!isLiteral(unwrappedLeft) || unwrappedRight === undefined) {
      return;
    }

    const op = be.getOperatorToken();

    if (op.getKind() === SyntaxKind.BarBarToken) {
      be.replaceWithText(
        simplifyBarBarExpression(unwrappedLeft, unwrappedRight).getFullText(),
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

const simplifyPrefixUnaryExpression = (pue: PrefixUnaryExpression) => {
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

  const unwrapped = isCodemodLiteral(operand)
    ? getCodemodLiteralValue(operand)
    : operand;

  if (!isLiteral(unwrapped)) {
    return;
  }

  const isSame = count % 2 === 0;
  const booleanValue = isSame ? isTruthy(unwrapped) : !isTruthy(unwrapped);
  const replacement = ts.factory.createLiteralTypeNode(
    booleanValue ? ts.factory.createTrue() : ts.factory.createFalse(),
  );

  pue.replaceWithText(printNode(replacement));
};

const getReplacementText = (
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
const replaceSDKMethodCalls = (
  sourceFile: SourceFile,
  options: Options,
  provider: Provider,
): boolean => {
  const matcher = provider.getMatcher(options.key);
  let replaced = false;

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((ce) => {
    const match = matcher(ce);

    if (match === null) {
      return;
    }

    const replacementText = getReplacementText(provider, options, match.name);
    const parent = ce.getParent();

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
const refactorMemberExpressions = (sourceFile: SourceFile) => {
  getCodemodLiterals(sourceFile).forEach((ce) => {
    const parent = ce.getParent();
    const ole = getCodemodLiteralValue(ce);

    if (!Node.isObjectLiteralExpression(ole)) {
      return;
    }

    if (Node.isPropertyAccessExpression(parent)) {
      const nameNode = parent.getNameNode();

      if (!Node.isIdentifier(nameNode)) {
        return;
      }

      const propertyName = nameNode.getText();

      // if property does not exists on the object, remove the whole statement
      if (ole.getProperty(propertyName) === undefined) {
        parent.getFirstAncestorByKind(SyntaxKind.ExpressionStatement)?.remove();
        return;
      }

      const text = getPropertyValueAsText(ole, propertyName);

      if (text !== null) {
        parent.replaceWithText(`${CODEMOD_LITERAL}(${text})`);
      }
    }

    if (!parent?.wasForgotten() && Node.isElementAccessExpression(parent)) {
      const arg = parent.getArgumentExpression();

      if (!Node.isStringLiteral(arg)) {
        return;
      }

      const text = getPropertyValueAsText(ole, arg.getLiteralText());
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
const refactorReferences = (sourceFile: SourceFile) => {
  getCodemodLiterals(sourceFile).forEach((ce) => {
    const vd = ce.getParent();

    if (!Node.isVariableDeclaration(vd)) {
      return;
    }

    const nameNode = vd.getNameNode();

    if (!Node.isIdentifier(nameNode)) {
      return;
    }

    const references = nameNode.findReferencesAsNodes();

    if (references.length === 0) {
      return;
    }

    nameNode.findReferencesAsNodes().forEach((ref) => {
      const replacer = getCodemodLiteralValue(ce);

      if (replacer === undefined) {
        return;
      }

      // we cannot directly replace shorthand property, e.g { a, b, c } with literal
      const parent = ref.getParent();

      if (Node.isShorthandPropertyAssignment(parent)) {
        const propertyAssignment = ts.factory.createPropertyAssignment(
          ts.factory.createIdentifier(ref.getText()),
          ts.factory.createNumericLiteral(
            `${CODEMOD_LITERAL}(${replacer.getFullText()})`,
          ),
        );

        parent.replaceWithText(printNode(propertyAssignment));
        return;
      }

      // @TODO
      ref.replaceWithText(`${CODEMOD_LITERAL}(${replacer.getFullText()})`);
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
const simplifyUnaryExpressions = (sourceFile: SourceFile) => {
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
const evaluateBinaryExpressions = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((be) => {
    const left = be.getLeft();
    const right = be.getRight();

    const unwrappedLeft = isCodemodLiteral(left)
      ? getCodemodLiteralValue(left)
      : left;
    const unwrappedRight = isCodemodLiteral(right)
      ? getCodemodLiteralValue(right)
      : right;

    const op = be.getOperatorToken();

    if (
      op.getKind() === SyntaxKind.EqualsEqualsEqualsToken &&
      isPrimitiveLiteral(unwrappedLeft) &&
      isPrimitiveLiteral(unwrappedRight)
    ) {
      be.replaceWithText(
        String(
          unwrappedLeft.getLiteralValue() === unwrappedRight.getLiteralValue(),
        ),
      );
    }
  });
};

const removeUselessParenthesis = (sourceFile: SourceFile) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ParenthesizedExpression)
    .forEach((pe) => {
      if (pe.wasForgotten()) {
        return;
      }

      const expression = pe.getExpression();

      const unwrapped = isCodemodLiteral(expression)
        ? getCodemodLiteralValue(expression)
        : expression;

      if (isLiteral(unwrapped)) {
        pe.replaceWithText(`${CODEMOD_LITERAL}(${getLiteralText(unwrapped)})`);
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
const refactorIfStatements = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).forEach((ifs) => {
    const expression = ifs.getExpression();

    const unwrapped = isCodemodLiteral(expression)
      ? getCodemodLiteralValue(expression)
      : expression;

    if (Node.isTrueLiteral(unwrapped)) {
      ifs.replaceWithText(getBlockText(ifs.getThenStatement()));
    } else if (Node.isFalseLiteral(unwrapped)) {
      ifs.remove();
    }
  });
};

/**
 * Replaces conditional statements with single literal in condition
 *
 * const a = true ? x : y; ===> const a = x;
 */

const refactorConditionalExpressions = (sourceFile: SourceFile) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ConditionalExpression)
    .forEach((ce) => {
      const condition = ce.getCondition();

      const unwrapped = isCodemodLiteral(condition)
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
const removeCodemodLiteralWrapper = (sourceFile: SourceFile) => {
  getCodemodLiterals(sourceFile).forEach((ce) => {
    if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
      ce.getParent()?.replaceWithText(
        getCodemodLiteralValue(ce)?.getFullText() ?? "",
      );
      return;
    }
    const literal = getCodemodLiteralValue(ce);

    const text =
      Node.isObjectLiteralExpression(literal) &&
      !Node.isVariableDeclaration(ce.getParent()) &&
      !Node.isCallExpression(ce.getParent())
        ? `(${literal.getFullText()})`
        : literal?.getFullText() ?? "";

    ce.replaceWithText(text);
  });
};

export function handleSourceFile(
  sourceFile: SourceFile,
  options: Options,
): string | undefined {
  const { provider } = options;

  const replaced = replaceSDKMethodCalls(sourceFile, options, provider);

  if (!replaced) {
    return undefined;
  }

  repeatCallback(() => {
    // console.log("replaceSDKMethodCalls", sourceFile.getFullText());
    refactorMemberExpressions(sourceFile);
    // console.log("refactorMemberExpressions", sourceFile.getFullText());
    refactorReferences(sourceFile);
    // console.log("refactorReferences", sourceFile.getFullText());
    simplifyUnaryExpressions(sourceFile);

    // console.log("simplifyUnaryExpressions", sourceFile.getFullText());
    evaluateBinaryExpressions(sourceFile);

    evaluateLogicalExpressions(sourceFile);

    removeUselessParenthesis(sourceFile);
    // console.log("evaluateLogicalExpressions", sourceFile.getFullText());

    refactorIfStatements(sourceFile);
    refactorConditionalExpressions(sourceFile);
  }, 5);

  removeCodemodLiteralWrapper(sourceFile);
  return sourceFile.getFullText();
}
