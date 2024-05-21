import { type CallExpression, Node, ts } from "ts-morph";
import { buildLiteral, getCEExpressionName } from "../utils.js";

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
        buildLiteral(type, value),
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("defaultValue"),
        buildLiteral(type, value),
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
  return buildLiteral(type, value);
};

type MatchedMethod = {
  name: string;
};

export const DevCycle = {
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
