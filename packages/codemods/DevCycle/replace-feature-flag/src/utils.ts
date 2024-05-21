import {
  type CallExpression,
  type FalseLiteral,
  Node,
  type NumericLiteral,
  type ObjectLiteralExpression,
  type StringLiteral,
  type TrueLiteral,
  ts,
} from "ts-morph";
import type { VariableType, VariableValue } from "./providers/statsig.js";

const { factory } = ts;

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

type Literal =
  | StringLiteral
  | NumericLiteral
  | TrueLiteral
  | FalseLiteral
  | ObjectLiteralExpression;

export const isLiteral = (node: Node | undefined): node is Literal =>
  Node.isStringLiteral(node) ||
  Node.isNumericLiteral(node) ||
  Node.isTrueLiteral(node) ||
  Node.isFalseLiteral(node) ||
  Node.isObjectLiteralExpression(node);

export const getLiteralText = (node: Literal) =>
  Node.isObjectLiteralExpression(node)
    ? node.getFullText()
    : String(node.getLiteralValue());

export const isTruthy = (node: Literal) => {
  return (
    Node.isTrueLiteral(node) ||
    (Node.isStringLiteral(node) && node.getLiteralText() !== "") ||
    (Node.isNumericLiteral(node) && node.getLiteralText() !== "0") ||
    Node.isObjectLiteralExpression(node)
  );
};
export const repeatCallback = (
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
