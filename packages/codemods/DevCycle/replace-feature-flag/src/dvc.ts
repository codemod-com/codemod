import { type CallExpression, Node, printNode, ts } from "ts-morph";

type VariableType = "String" | "Boolean" | "Number" | "JSON";
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
    case "String": {
      return factory.createStringLiteral(value.toString());
    }
    case "Number": {
      return factory.createNumericLiteral(Number(value));
    }
    case "Boolean": {
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

const getVariableReplacerNode = (
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

const getVariableValueReplacerNode = (
  key: string,
  type: VariableType,
  value: VariableValue,
) => {
  return getTypeLiteral(type, value);
};

type MatchedMethod = {
  name: string;
};

export const DVC = {
  getMatcher:
    (keyName: string) =>
    (ce: CallExpression): MatchedMethod | null => {
      const name = getCEExpressionName(ce);

      if (name === null || !names.includes(name)) {
        return null;
      }

      const args = ce.getArguments();
      const keyArg = args.length === 3 ? args[1] : args[0];

      if (Node.isIdentifier(keyArg)) {
        const maybeVariableDeclaration = keyArg
          .getDefinitions()
          ?.at(0)
          ?.getNode()
          ?.getParent();

        if (Node.isVariableDeclaration(maybeVariableDeclaration)) {
          const maybeStringLiteral = maybeVariableDeclaration.getInitializer();

          if (
            Node.isStringLiteral(maybeStringLiteral) &&
            maybeStringLiteral.getLiteralText() === keyName
          ) {
            return { name };
          }
        }
      }

      if (Node.isStringLiteral(keyArg) && keyArg.getLiteralText() === keyName) {
        return { name };
      }

      return null;
    },
  getReplacer: (
    key: string,
    type: VariableType,
    value: VariableValue,
    name: string,
  ) => {
    const node = ["variableValue", "useVariableValue"].includes(name)
      ? getVariableValueReplacerNode(key, type, value)
      : getVariableReplacerNode(key, type, value);

    return node;
  },
};
