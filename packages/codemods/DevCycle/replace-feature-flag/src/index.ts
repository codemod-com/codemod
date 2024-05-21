import {
  type CallExpression,
  type Expression,
  type FalseLiteral,
  Node,
  type NumericLiteral,
  type ObjectLiteralExpression,
  type PrefixUnaryExpression,
  type SourceFile,
  type StringLiteral,
  SyntaxKind,
  type TrueLiteral,
  printNode,
  ts,
} from "ts-morph";
import { DVC } from "./dvc.js";

const CODEMOD_LITERAL = "__CODEMOD_LITERAL__";

type VariableType = "string" | "boolean" | "number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;
type Providers = "DevCycle" | "OpenFeature";

const PROVIDERS: Record<Providers, Provider> = {
  DevCycle: DVC,
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

const isLiteral = (
  node: Node,
): node is StringLiteral | NumericLiteral | TrueLiteral | FalseLiteral =>
  Node.isStringLiteral(node) ||
  Node.isNumericLiteral(node) ||
  Node.isTrueLiteral(node) ||
  Node.isFalseLiteral(node) ||
  Node.isObjectLiteralExpression(node);

const isTruthy = (node: Node) => {
  return (
    Node.isTrueLiteral(node) ||
    (Node.isStringLiteral(node) && node.getLiteralText() !== "") ||
    (Node.isNumericLiteral(node) && node.getLiteralText() !== "0") ||
    Node.isObjectLiteralExpression(node)
  );
};

const repeatCallback = (
  callback: (...args: any[]) => void,
  N: number,
): void => {
  if (typeof callback !== "function") {
    throw new TypeError("The first argument must be a function");
  }

  if (typeof N !== "number" || N < 0 || !Number.isInteger(N)) {
    throw new TypeError("The second argument must be a non-negative integer");
  }

  for (let i = 0; i < N; i++) {
    callback();
  }
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

    const unwrappedLeft = Node.isCallExpression(left)
      ? getCodemodLiteralValue(left)
      : left;
    const unwrappedRight = Node.isCallExpression(right)
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

  const unwrapped = Node.isCallExpression(operand)
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

const getCodemodLiteral = (sourceFile: SourceFile) => {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === CODEMOD_LITERAL);
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
    const replacementText = getReplacementText(DVC, options, match.name);
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
  getCodemodLiteral(sourceFile).forEach((ce) => {
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

      const text = getPropertyValueAsText(ole, nameNode.getText());

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
  getCodemodLiteral(sourceFile).forEach((ce) => {
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

const evaluateBinaryExpressions = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((be) => {
    const left = be.getLeft();
    const right = be.getRight();

    const unwrappedLeft = Node.isCallExpression(left)
      ? getCodemodLiteralValue(left)
      : left;
    const unwrappedRight = Node.isCallExpression(right)
      ? getCodemodLiteralValue(right)
      : right;

    const op = be.getOperatorToken();

    if (op.getKind() === SyntaxKind.EqualsEqualsEqualsToken) {
      if (isLiteral(unwrappedLeft) && isLiteral(unwrappedRight)) {
        const isSame =
          unwrappedLeft.getLiteralValue() === unwrappedRight.getLiteralValue();
        be.replaceWithText(isSame ? "true" : "false");
      }
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

      const unwrapped = Node.isCallExpression(expression)
        ? getCodemodLiteralValue(expression)
        : expression;

      if (isLiteral(unwrapped)) {
        pe.replaceWithText(
          `${CODEMOD_LITERAL}(${String(unwrapped?.getLiteralValue())})`,
        );
      } else if (Node.isParenthesizedExpression(unwrapped)) {
        pe.replaceWithText(unwrapped.getFullText());
      }
    });
};

const refactorIfStatements = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.IfStatement).forEach((ifs) => {
    const expression = ifs.getExpression();

    const unwrapped = Node.isCallExpression(expression)
      ? getCodemodLiteralValue(expression)
      : expression;

    if (Node.isTrueLiteral(unwrapped)) {
      ifs.replaceWithText(
        ifs
          .getThenStatement()
          .getDescendantStatements()
          .reduce((acc, s) => {
            acc += s.getFullText();
            return acc;
          }, ""),
      );
    } else if (Node.isFalseLiteral(unwrapped)) {
      ifs.remove();
    }
  });
};

const refactorConditionalExpressions = (sourceFile: SourceFile) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ConditionalExpression)
    .forEach((ce) => {
      const condition = ce.getCondition();

      const unwrapped = Node.isCallExpression(condition)
        ? getCodemodLiteralValue(condition)
        : condition;

      if (Node.isTrueLiteral(unwrapped)) {
        ce.replaceWithText(ce.getWhenTrue().getFullText());
      } else if (Node.isFalseLiteral(unwrapped)) {
        ce.replaceWithText(ce.getWhenFalse().getFullText());
      }
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

  getCodemodLiteral(sourceFile).forEach((ce) => {
    if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
      ce.getParent()?.replaceWithText(
        getCodemodLiteralValue(ce)?.getFullText() ?? "",
      );
      return;
    }

    ce.replaceWithText(getCodemodLiteralValue(ce)?.getFullText() ?? "");
  });

  return sourceFile.getFullText();
}
