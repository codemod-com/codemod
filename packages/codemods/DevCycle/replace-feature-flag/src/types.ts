import type { CallExpression, ts } from "ts-morph";

export type VariableType = "string" | "boolean" | "number" | "JSON";
export type VariableValue = string | boolean | number | Record<string, unknown>;

export type ProviderKind = "DevCycle" | "Statsig";

export type Provider = {
  getMatcher: (key: string) => (ce: CallExpression) => { name: string } | null;
  getReplacer: (
    key: string,
    type: VariableType,
    value: VariableValue,
    name: string,
  ) => ts.Node;
};

export type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  provider: ProviderKind;
};