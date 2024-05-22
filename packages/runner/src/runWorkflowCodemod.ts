import vm from "node:vm";
import astGrep from "@ast-grep/napi";
import type { ConsoleKind } from "@codemod-com/printer";
import type { ArgumentRecord } from "@codemod-com/utilities";
import workflow from "@codemod-com/workflow";
import { nullish, parse, string } from "valibot";
import { buildVmConsole } from "./buildVmConsole.js";
import { CONSOLE_OVERRIDE } from "./consoleOverride.js";

const transform = async (
  codemodSource: string,
  safeArgumentRecord: ArgumentRecord,
  consoleCallback: (kind: ConsoleKind, message: string) => void,
) => {
  const codeToExecute = `
		${CONSOLE_OVERRIDE}

		const __module__ = { exports: {} };

		const keys = ['module', 'exports'];
		const values = [__module__, __module__.exports];

		new Function(...keys, __CODEMOD_SOURCE__).apply(null, values);

		const workflow = typeof __module__.exports === 'function'
			? __module__.exports
			: __module__.exports.__esModule &&
			typeof __module__.exports.workflow === 'function'
			? __module__.exports.workflow
			: typeof __module__.exports.handleSourceFile === 'function'
			? __module__.exports.workflow
			: null;

		const { api } = require('@codemod-com/workflow');

		workflow(api);
	`;

  const exports = Object.freeze({});

  const context = vm.createContext({
    module: Object.freeze({
      exports,
    }),
    exports,
    __CODEMODCOM__argumentRecord: safeArgumentRecord,
    __CODEMODCOM__console__: buildVmConsole(consoleCallback),
    __CODEMOD_SOURCE__: codemodSource,
    require: (name: string) => {
      if (name === "@ast-grep/napi") {
        return astGrep;
      }
      if (name === "@codemod-com/workflow") {
        return workflow;
      }
    },
  });
  const value = vm.runInContext(codeToExecute, context, { timeout: 30000 });
  if (value instanceof Promise) {
    await value;
  }
};

export const runWorkflowCodemod = async (
  codemodSource: string,
  disablePrettier: boolean,
  safeArgumentRecord: ArgumentRecord,
  consoleCallback: (kind: ConsoleKind, message: string) => void,
) => {
  await transform(codemodSource, safeArgumentRecord, consoleCallback);
};
