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

type VariableType = "String" | "Boolean" | "Number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;

export type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  aliases?: Record<string, string>;
};

export const wrapWithMarker = (node: any) => {
  return ts.factory.createCallExpression(
    ts.factory.createIdentifier("__CODEMOD__"),
    undefined,
    [node],
  );
};

export const unwrap = (node: CallExpression) => {
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

  console.log(
    left.getFullText(),
    right.getFullText(),
    "simplifyAmpersandExpression???",
  );
  return isTruthy(left) ? right : left;
};

const simplifyBarBarExpression = (left: Expression, right: Expression) => {
  if (!isLiteral(left)) {
    return;
  }

  return isTruthy(left) ? left : right;
};

const evaluateLogicalExpressions = (sourceFile: SourceFile) => {
  console.log(sourceFile.getFullText(), "TEXT ON STEP:");
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

    if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
      ce.getParent()?.replaceWithText(
        printNode(
          wrapWithMarker(
            DVC.getReplacer(
              options.key,
              options.type,
              options.value,
              match.name,
            ),
          ),
        ),
      );

      return;
    }

    ce.replaceWithText(
      printNode(
        wrapWithMarker(
          DVC.getReplacer(options.key, options.type, options.value, match.name),
        ),
      ),
    );
  });

  /**
   * Refactor member expressions
   */
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .forEach((ole) => {
      const parent = ole.getParent();

      if (Node.isPropertyAccessExpression(parent)) {
        const nameNode = parent.getNameNode();

        if (!Node.isIdentifier(nameNode)) {
          return;
        }

        const text = getPropertyValueAsText(ole, nameNode.getText());

        if (text !== null) {
          parent.replaceWithText(text);
        }
      }

      if (!parent.wasForgotten() && Node.isElementAccessExpression(parent)) {
        const arg = parent.getArgumentExpression();

        if (!Node.isStringLiteral(arg)) {
          return;
        }

        const text = getPropertyValueAsText(ole, arg.getLiteralText());

        if (text !== null) {
          parent.replaceWithText(text);
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
        const replacer = unwrap(ce);

        if (replacer === undefined) {
          return;
        }

        ref.replaceWithText(replacer.getFullText());
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

  return sourceFile.getFullText();
}
