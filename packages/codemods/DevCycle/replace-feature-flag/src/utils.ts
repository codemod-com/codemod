import {
  type Block,
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
import { CODEMOD_LITERAL } from "./index.js";
import type { VariableType, VariableValue } from "./providers/statsig.js";

const CODEMOD_LITERAL = "__CODEMOD_LITERAL__";

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

type PrimitiveLiteral =
  | StringLiteral
  | NumericLiteral
  | TrueLiteral
  | FalseLiteral;

type Literal = PrimitiveLiteral | ObjectLiteralExpression;

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
export const getCodemodLiterals = (sourceFile: SourceFile) => {
  return sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter((ce) => ce.getExpression().getText() === CODEMOD_LITERAL);
};

export const getBlockText = (node: Statement) =>
  node.getDescendantStatements().reduce((acc, s) => {
    acc += s.getFullText();
    return acc;
  }, "");
