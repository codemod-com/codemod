import { type CallExpression, Node, ts } from "ts-morph";
import type { Provider, VariableType, VariableValue } from "../types.js";
import { getCEExpressionName } from "../utils.js";
import { buildLiteral } from "../utils.js";

const names = ["useFlag"];

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

export const Netlify: Provider = {
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
    return getVariableValueReplacerNode(key, type, value);
  },
};
