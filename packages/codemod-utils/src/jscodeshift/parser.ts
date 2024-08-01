import babylon, { type ParserOptions } from "@babel/parser";
import type { Parser } from "jscodeshift";

export const defaultJSCodeshiftOptions: ParserOptions = {
  sourceType: "module",
  allowImportExportEverywhere: true,
  allowReturnOutsideFunction: true,
  startLine: 1,
  tokens: true,
  plugins: [
    "asyncGenerators",
    "bigInt",
    "classPrivateMethods",
    "classPrivateProperties",
    "classProperties",
    "doExpressions",
    "dynamicImport",
    "exportDefaultFrom",
    "exportNamespaceFrom",
    "functionBind",
    "functionSent",
    "importMeta",
    "nullishCoalescingOperator",
    "numericSeparator",
    "objectRestSpread",
    "optionalCatchBinding",
    "optionalChaining",
    ["pipelineOperator", { proposal: "minimal" }],
    "throwExpressions",
    "typescript",
    "estree",
    "jsx",
    "asyncGenerators",
    "classProperties",
    "doExpressions",
    "functionBind",
    "functionSent",
    "objectRestSpread",
    "importAttributes",
    "dynamicImport",
    "nullishCoalescingOperator",
    "optionalChaining",
    ["decorators", { decoratorsBeforeExport: false }],
  ],
};

export const defaultJSCodeshiftParser: Parser = {
  parse: (source: string) => babylon.parse(source, defaultJSCodeshiftOptions),
};
