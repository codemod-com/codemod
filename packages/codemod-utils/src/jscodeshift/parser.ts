import babylon, { type ParserOptions } from "@babel/parser";
import type { Parser } from "jscodeshift";

/**
 * Provides a default configuration for the Babylon parser used by the jscodeshift library.
 * This configuration enables support for a wide range of modern JavaScript syntax features,
 * including ES6 modules, async/await, optional chaining, and more.
 */
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

/**
 * Provides a default parser configuration for use with the jscodeshift library.
 * This parser is configured to support a wide range of modern JavaScript syntax
 * features, including ES6 modules, async/await, optional chaining, and more.
 *
 * @param {string} source - The JavaScript source code to be parsed.
 * @returns {any} - The parsed AST representation of the input source code.
 */
export const defaultJSCodeshiftParser: Parser = {
  parse: (source: string) => babylon.parse(source, defaultJSCodeshiftOptions),
};
