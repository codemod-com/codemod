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
} from "ts-morph";
import type { VariableType, VariableValue } from "./types.js";

const { factory } = ts;

export const CODEMOD_LITERAL = "__CODEMOD_LITERAL__";

export const getCEExpressionName = (ce: CallExpression): string | null => {
  const expr = ce.getExpression();

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
export const buildLiteral = (type: VariableType, value: VariableValue) => {
  switch (type) {
    case "string": {
      return factory.createStringLiteral(value.toString());
    }
    case "number": {
      return factory.createNumericLiteral(Number(value));
    }
    case "boolean": {
      return value === "true" ? factory.createTrue() : factory.createFalse();
    }
    case "JSON": {
      return factory.createCallExpression(
        factory.createPropertyAccessExpression(
          factory.createIdentifier("JSON"),
          factory.createIdentifier("parse"),
        ),
        undefined,
        [factory.createStringLiteral(value.toString())],
      );
    }
  }
};

export type PrimitiveLiteral =
  | StringLiteral
  | NumericLiteral
  | TrueLiteral
  | FalseLiteral;

export type Literal = PrimitiveLiteral | ObjectLiteralExpression;

export const isLiteral = (node: Node | undefined): node is Literal =>
  isPrimitiveLiteral(node) || Node.isObjectLiteralExpression(node);

export const isPrimitiveLiteral = (
  node: Node | undefined,
): node is PrimitiveLiteral =>
  Node.isStringLiteral(node) ||
  Node.isNumericLiteral(node) ||
  Node.isTrueLiteral(node) ||
  Node.isFalseLiteral(node);

export const getLiteralText = (node: Literal) =>
  Node.isObjectLiteralExpression(node)
    ? node.getFullText()
    : String(node.getLiteralValue());

export const isCodemodLiteral = (node: Node): node is CallExpression => {
  return (
    Node.isCallExpression(node) &&
    node.getExpression().getText() === CODEMOD_LITERAL
  );
};

export const isTruthy = (node: Literal) => {
  return "getLiteralValue" in node ? Boolean(node.getLiteralValue()) : true;
};

export const repeatCallback = (
  callback: (abort: () => void) => void,
  N: number,
): void => {
  if (typeof callback !== "function") {
    throw new TypeError("The first argument must be a function");
  }

  if (typeof N !== "number" || N < 0 || !Number.isInteger(N)) {
    throw new TypeError("The second argument must be a non-negative integer");
  }

  let shouldContinue = true;
  let i = 0;

  const abort = () => {
    shouldContinue = false;
  };

  while (i < N && shouldContinue) {
    callback(abort);
    i++;
  }
};
export const getCodemodLiterals = (sourceFile: SourceFile) => {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === CODEMOD_LITERAL);
};

export const getBlockText = (node: Statement) => {
  const fullText = node.getFullText();

  const idx1 = fullText.indexOf("{");
  const idx2 = fullText.lastIndexOf("}");

  return fullText.slice(idx1 + 1, idx2);
};

export const buildCodemodLiteral = (node: ts.Expression) => {
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
