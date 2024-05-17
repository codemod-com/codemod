import { type CallExpression, Node, printNode, ts } from "ts-morph";

type VariableType = "string" | "boolean" | "number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;

const { factory } = ts;

const names = [
  "variable",
  "variableValue",
  "useVariable",
  "useDVCVariable",
  "useVariableValue",
];

const getCEExpressionName = (ce: CallExpression): string | null => {
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

const getTypeLiteral = (type: VariableType, value: VariableValue) => {
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

const getReplacerNode = (
  key: string,
  type: VariableType,
  value: VariableValue,
) => {
  return factory.createObjectLiteralExpression(
    [
      factory.createPropertyAssignment(
        factory.createIdentifier("key"),
        factory.createStringLiteral(key),
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("value"),
        getTypeLiteral(type, value),
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("defaultValue"),
        getTypeLiteral(type, value),
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("isDefaulted"),
        factory.createTrue(),
      ),
    ],
    true,
  );
};

export const DVC = {
  getMatcher: (keyName: string) => (ce: CallExpression) => {
    const name = getCEExpressionName(ce);

    if (!names.includes(name ?? "")) {
      return false;
    }

    const args = ce.getArguments();
    const keyArg = args.length === 3 ? args[1] : args[0];

    const declarations =
      (Node.isIdentifier(keyArg) &&
        keyArg
          .getDefinitions()
          ?.map((d) => d.getNode().getParent()?.getFullText())) ??
      [];

    console.log(...declarations, "DECLAR");

    return Node.isStringLiteral(keyArg) && keyArg.getLiteralText() === keyName;
  },
  getReplacer: (key: string, type: VariableType, value: VariableValue) => () =>
    printNode(getReplacerNode(key, type, value)),
};
