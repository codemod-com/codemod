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

type VariableType = "String" | "Boolean" | "Number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;

export type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  aliases?: Record<string, string>;
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
  Node.isFalseLiteral(node);

const isTruthy = (node: Node) => {
  return Node.isTrueLiteral(node);
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

const evaluateLogicalExpressions = (sourceFile: SourceFile) => {
  sourceFile.getDescendantsOfKind(SyntaxKind.BinaryExpression).forEach((be) => {
    if (be.wasForgotten()) {
      return;
    }

    const left = be.getLeft();
    const right = be.getRight();
    const op = be.getOperatorToken();

    if (op.getKind() === SyntaxKind.BarBarToken) {
      const node = simplifyBarBarExpression(left, right);

      if (node) {
        be.replaceWithText(node.getFullText());
      }
    }

    // true &&
    // @TODO we can check for other truthy
    else if (op.getKind() === SyntaxKind.AmpersandAmpersandToken) {
      const node = simplifyAmpersandExpression(left, right);

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

  if (!isLiteral(operand)) {
    return;
  }

  const isSame = count % 2 === 0;
  const newLiteral = isSame ? isTruthy(operand) : !isTruthy(operand);
  const replacement = ts.factory.createLiteralTypeNode(
    newLiteral ? ts.factory.createTrue() : ts.factory.createFalse(),
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

export function handleSourceFile(
  sourceFile: SourceFile,
  options: Options,
): string | undefined {
  const matcher = DVC.getMatcher(options.key);

  /**
   * Replace SDK calls
   */
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

  /**
   * Refactor member expressions
   */
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === "__CODEMOD__")
    .forEach((ce) => {
      const parent = ce.getParent();

      const ole = ce.getArguments().at(0);

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
          parent.replaceWithText(`__CODEMOD__(${text})`);
        }
      }

      if (!parent?.wasForgotten() && Node.isElementAccessExpression(parent)) {
        const arg = parent.getArgumentExpression();

        if (!Node.isStringLiteral(arg)) {
          return;
        }

        const text = getPropertyValueAsText(ole, arg.getLiteralText());

        if (text !== null) {
          parent.replaceWithText(`__CODEMOD__(${text})`);
        }
      }
    });

  /**
   * Refactor references
   */
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === "__CODEMOD__")
    .forEach((ce) => {
      const vd = ce.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);

      if (vd === undefined) {
        return;
      }

      const nameNode = vd.getNameNode();

      if (!Node.isIdentifier(nameNode)) {
        return;
      }

      nameNode.findReferencesAsNodes().forEach((ref) => {
        const replacer = getCodemodLiteralValue(ce);

        if (replacer === undefined) {
          return;
        }

        ref.replaceWithText(`__CODEMOD__(${replacer.getFullText()})`);
      });
    });

  /**
   * Refactor unary operators
   */

  sourceFile
    .getDescendantsOfKind(SyntaxKind.PrefixUnaryExpression)
    .filter((pue) => {
      return pue.compilerNode.operator === SyntaxKind.ExclamationToken;
    })
    .forEach(simplifyPrefixUnaryExpression);

  /**
   * Evaluate binary expressions
   */

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

  /**
   * Evaluate logical expressions
   */

  repeatCallback(() => {
    evaluateLogicalExpressions(sourceFile);
    sourceFile
      .getDescendantsOfKind(SyntaxKind.ParenthesizedExpression)
      .forEach((pe) => {
        const expression = pe.getExpression();

        if (isLiteral(expression)) {
          pe.replaceWithText(String(expression?.getLiteralValue()));
        }
      });
  }, 3);

  /**
   * Refactor if statements
   */
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

  /**
   * Refactor conditional expressions
   */
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

  /**
   * Unwrap all literals
   */

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === "__CODEMOD__")
    .forEach((ce) => {
      if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
        ce.getParent()?.replaceWithText(
          getCodemodLiteralValue(ce)?.getFullText() ?? "",
        );
        return;
      }

      console.log(
        ce.getParent()?.getKindName(),
        getCodemodLiteralValue(ce)?.getFullText(),
        "??",
      );
      ce.replaceWithText(getCodemodLiteralValue(ce)?.getFullText() ?? "");
    });

  return sourceFile.getFullText();
}
