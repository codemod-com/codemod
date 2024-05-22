import {
  type CallExpression,
  type Expression,
  Node,
  type ObjectLiteralExpression,
  type PrefixUnaryExpression,
  type SourceFile,
  SyntaxKind,
  printNode,
  ts,
} from "ts-morph";
import { DevCycle, Statsig } from "./providers/index.js";
import {
  getBlockText,
  getLiteralText,
  isCodemodLiteral,
  isLiteral,
  isPrimitiveLiteral,
} from "./utils.js";
import { isTruthy } from "./utils.js";
import { repeatCallback } from "./utils.js";
import { getCodemodLiterals } from "./utils.js";

export const CODEMOD_LITERAL = "__CODEMOD_LITERAL__";

type VariableType = "string" | "boolean" | "number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;
type Providers = "DevCycle" | "OpenFeature" | "Statsig";

const PROVIDERS: Record<Providers, Provider> = {
  DevCycle: DevCycle,
  Statsig,
};

export type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  provider: Providers;
};

export const buildCodemodLiteral = (node: any) => {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier(CODEMOD_LITERAL),
    undefined,
    [node],
  );
};

export const getCodemodLiteralValue = (node: CallExpression) => {
  return node.getArguments().at(0);
};

export const getPropertyValueAsText = (
  ole: ObjectLiteralExpression,
  propertyName: string,
) => {
  if (ole.wasForgotten()) {
    return;
  }

  const property = ole.getProperty(propertyName);

  if (!Node.isPropertyAssignment(property)) {
    return null;
  }

  const propertyValue = property.getInitializer();

  if (
    !Node.isStringLiteral(propertyValue) &&
    !Node.isNumericLiteral(propertyValue) &&
    !Node.isTrueLiteral(propertyValue) &&
    !Node.isFalseLiteral(propertyValue)
  ) {
    return null;
  }

  return propertyValue.getFullText();
};

const simplifyAmpersandExpression = (left: Expression, right: Expression) => {
  if (!isLiteral(left)) {
    return;
  }

  return isTruthy(left) ? right : left;
};

const simplifyBarBarExpression = (left: Expression, right: Expression) => {
  if (!isLiteral(left)) {
    return;
  }

  return isTruthy(left) ? left : right;
};

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

    const op = be.getOperatorToken();

    if (op.getKind() === SyntaxKind.BarBarToken) {
      const node = simplifyBarBarExpression(unwrappedLeft, unwrappedRight);

      if (node) {
        be.replaceWithText(node.getFullText());
      }
    } else if (op.getKind() === SyntaxKind.AmpersandAmpersandToken) {
      const node = simplifyAmpersandExpression(unwrappedLeft, unwrappedRight);

      if (node) {
        be.replaceWithText(node.getFullText());
      }
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

const getReplacementText = (provider: any, options: Options, name: string) => {
  return printNode(
    buildCodemodLiteral(
      provider.getReplacer(options.key, options.type, options.value, name),
    ),
  );
};

interface Provider {
  getMatcher: (key: string) => (ce: CallExpression) => { name: string } | null;
  getReplacer: (
    key: string,
    type: VariableType,
    value: VariableValue,
    name: string,
  ) => string;
}

const getProvider = (provider: Providers) => PROVIDERS[provider];

/**
 * Replaces Provider method calls with return value of the call
 * wraps the return value with __CODEMOD_LITERAL__ to distinguish it from other literals
 * useVariable(user, 'key', true) ===> __CODEMOD_LITERAL__({...})
 */
const replaceSDKMethodCalls = (
  sourceFile: SourceFile,
  options: Options,
  provider: Provider,
) => {
  const matcher = provider.getMatcher(options.key);

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((ce) => {
    const match = matcher(ce);

    if (match === null) {
      return;
    }
    const replacementText = getReplacementText(provider, options, match.name);
    const parent = ce.getParent();

    if (parent?.getKind() === SyntaxKind.ExpressionStatement) {
      parent.replaceWithText(replacementText);
      return;
    }

    ce.replaceWithText(replacementText);
  });
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

      if (Node.isTrueLiteral(unwrapped)) {
        ce.replaceWithText(ce.getWhenTrue().getText());
      } else if (Node.isFalseLiteral(unwrapped)) {
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
  const provider = getProvider(options.provider);

  repeatCallback(() => {
    replaceSDKMethodCalls(sourceFile, options, provider);
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
