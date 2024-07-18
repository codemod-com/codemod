import { extname } from "node:path";
import vm from "node:vm";
import jscodeshift, { type API } from "jscodeshift";
import { nullish, parse, string } from "valibot";

import type { ConsoleKind } from "@codemod-com/printer";
import type {
  ArgumentRecord,
  EngineOptions,
  FileCommand,
} from "@codemod-com/utilities";

import { getAdapterByExtname } from "#adapters/index.js";
import { CONSOLE_OVERRIDE } from "#constants.js";
import { buildVmConsole } from "./common.js";

export const buildApi = (parser: string): API => ({
  j: jscodeshift.withParser(parser),
  jscodeshift: jscodeshift.withParser(parser),
  stats: () => {},
  report: () => {},
});

const transform = (
  codemodSource: string,
  oldPath: string,
  oldData: string,
  api: API,
  options: {
    // the options will be of type ArgumentRecord
    // after the removal of the createFile function
    [x: string]: unknown;
    createFile: (newPath: string, newData: string) => void;
  },
  consoleCallback: (kind: ConsoleKind, message: string) => void,
): string | undefined | null => {
  const codeToExecute = `
		${CONSOLE_OVERRIDE}

		const __module__ = { exports: {} };

		const keys = ['module', 'exports'];
		const values = [__module__, __module__.exports];

		new Function(...keys, __CODEMOD_SOURCE__).apply(null, values);

		const transform = typeof __module__.exports === 'function'
			? __module__.exports
			: __module__.exports.__esModule &&
			typeof __module__.exports.default === 'function'
			? __module__.exports.default
			: null;

		transform(__CODEMODCOM__file, __CODEMODCOM__api, __CODEMODCOM__options);
	`;

  // Create a new context for the code execution
  const exports = Object.freeze({});

  const context = vm.createContext({
    module: Object.freeze({
      exports,
    }),
    exports,
    __CODEMODCOM__file: { source: oldData, path: oldPath },
    __CODEMODCOM__api: api,
    __CODEMODCOM__options: options,
    __CODEMODCOM__console__: buildVmConsole(consoleCallback),
    __CODEMOD_SOURCE__: codemodSource,
  });

  const value = vm.runInContext(codeToExecute, context);

  return parse(nullish(string()), value);
};

export const runJscodeshiftCodemod = (
  codemodSource: string,
  oldPath: string,
  oldData: string,
  formatWithPrettier: boolean,
  safeArgumentRecord: ArgumentRecord,
  engineOptions: EngineOptions & { engine: "jscodeshift" },
  consoleCallback: (kind: ConsoleKind, message: string) => void,
): readonly FileCommand[] => {
  const commands: FileCommand[] = [];

  const adapter = getAdapterByExtname(extname(oldPath));

  const createFile = (newPath: string, newData: string): void => {
    commands.push({
      kind: "createFile",
      newPath,
      newData,
      formatWithPrettier,
    });
  };

  const api = buildApi(engineOptions?.parser ?? "tsx");

  const transformFn = adapter !== null ? adapter(transform) : transform;

  const newData = transformFn(
    codemodSource,
    oldPath,
    oldData,
    api,
    {
      ...safeArgumentRecord,
      createFile,
    },
    consoleCallback,
  );

  if (typeof newData !== "string" || oldData === newData) {
    return commands;
  }

  if (adapter === null) {
    // sometimes codemods produce newData even though they are literally no changes
    // by removing parentheses around return statements, we will likely find the pointless results
    const oldRoot = api.jscodeshift(oldData);
    const newRoot = api.jscodeshift(newData);

    oldRoot
      .find(api.j.ParenthesizedExpression)
      .replaceWith((path) => path.node.expression);

    newRoot
      .find(api.j.ParenthesizedExpression)
      .replaceWith((path) => path.node.expression);

    if (oldRoot.toSource() === newRoot.toSource()) {
      return commands;
    }
  }

  commands.push({
    kind: "updateFile",
    oldPath,
    oldData: oldData,
    newData,
    formatWithPrettier,
  });

  return commands;
};
