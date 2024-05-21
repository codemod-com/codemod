import { type CallExpression, Node, ts } from "ts-morph";
import type { VariableType, VariableValue } from "./statsig.js";

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
