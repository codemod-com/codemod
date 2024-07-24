import vm from "node:vm";
import astGrep from "@ast-grep/napi";

import type { ConsoleKind } from "@codemod-com/printer";
import type { ArgumentRecord } from "@codemod-com/utilities";
import * as workflow from "@codemod.com/workflow";

import { CONSOLE_OVERRIDE } from "#constants.js";
import { buildVmConsole } from "./common.js";

const transform = async (
  codemodSource: string,
  safeArgumentRecord: ArgumentRecord,
  consoleCallback: (kind: ConsoleKind, message: string) => void,
  authService?: workflow.AuthServiceInterface,
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

		const { api, setAuthService } = require('@codemod.com/workflow');

    setAuthService(__CODEMODCOM__authService__);

		promise = workflow(api);
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
    __CODEMODCOM__authService__: authService,
    require: (name: string) => {
      if (name === "@ast-grep/napi") {
        return astGrep;
      }
      if (name === "@codemod.com/workflow") {
        return workflow;
      }
    },
    promise: undefined,
  });

  vm.runInContext(codeToExecute, context, {
    timeout: 30000,
  });

  if (context.promise) {
    try {
      await context.promise;
    } catch (e) {
      console.error(e);
    }
  }
};

export const runWorkflowCodemod = async (
  codemodSource: string,
  safeArgumentRecord: ArgumentRecord,
  consoleCallback: (kind: ConsoleKind, message: string) => void,
  authService?: workflow.AuthServiceInterface,
) => {
  await transform(
    codemodSource,
    safeArgumentRecord,
    consoleCallback,
    authService,
  );
};
