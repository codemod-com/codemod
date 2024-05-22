import type { SourceFile } from "ts-morph";
import { type CallExpression, Node, ts } from "ts-morph";

import { handleSourceFile as handleSourceFileCore } from "../../../replace-feature-flag-core/src/index.js";
import type {
  Options,
  Provider,
  VariableType,
  VariableValue,
} from "../../../replace-feature-flag-core/src/types.js";

import {
  buildLiteral,
  getCEExpressionName,
} from "../../../replace-feature-flag-core/src/utils.js";

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

export const provider: Provider = {
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

export function handleSourceFile(
  sourceFile: SourceFile,
  options: Omit<Options, "provider">,
): string | undefined {
  return handleSourceFileCore(sourceFile, { ...options, provider });
}
