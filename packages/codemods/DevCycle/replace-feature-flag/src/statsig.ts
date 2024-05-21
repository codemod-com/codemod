import { type CallExpression, Node, ts } from "ts-morph";
import { getCEExpressionName } from "./utils.js";
import { buildLiteral } from "./utils.js";

export type VariableType = "string" | "boolean" | "number" | "JSON";
export type VariableValue = string | boolean | number | Record<string, unknown>;

const { factory } = ts;

const names = ["checkGate", "useGate"];

const getVariableReplacerNode = (
  key: string,
  type: VariableType,
  value: VariableValue,
) => {
  return factory.createObjectLiteralExpression(
    [
      factory.createPropertyAssignment(
        factory.createIdentifier("isLoading"),
        factory.createFalse(),
      ),
      factory.createPropertyAssignment(
        factory.createIdentifier("value"),
        buildLiteral(type, value),
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

export const Statsig = {
  getMatcher:
    (keyName: string) =>
    (ce: CallExpression): MatchedMethod | null => {
      const name = getCEExpressionName(ce);

      if (name === null || !names.includes(name)) {
        return null;
      }

      const args = ce.getArguments();
      const keyArg = args.at(0);

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
    const node =
      name === "checkGate"
        ? getVariableValueReplacerNode(key, type, value)
        : getVariableReplacerNode(key, type, value);

    return node;
  },
};
