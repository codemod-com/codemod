import { deepStrictEqual } from 'node:assert';
import vm from 'node:vm';
import type { ConsoleKind } from '@codemod-com/printer';
import { describe, it } from 'vitest';
import { buildVmConsole } from '../src/buildVmConsole.js';
import { CONSOLE_OVERRIDE } from '../src/consoleOverride.js';

describe('console', () => {
	it('should pick the console statements from the VM', async () => {
		let codeToExecute = `
            // bindings
			${CONSOLE_OVERRIDE}

            // statements
            console.debug('%d debug %s', 1, 'test');
            console.error('%d error %s', 2, 'test');
            console.log('%d log %s', 3, 'test');
			console.info('%d info %s', 4, 'test');
			console.trace('%d trace %s', 5, 'test');
			console.warn('%d warn %s', 6, 'test');
        `;

		let messages: [ConsoleKind, string][] = [];

		let customCallback = (kind: ConsoleKind, message: string) => {
			messages.push([kind, message]);
		};

		let exports = {};

		let context = vm.createContext({
			module: {
				exports,
			},
			exports,
			__CODEMODCOM__console__: buildVmConsole(customCallback),
		});

		await vm.runInContext(codeToExecute, context);

		deepStrictEqual(messages, [
			['debug', '1 debug test'],
			['error', '2 error test'],
			['log', '3 log test'],
			['info', '4 info test'],
			['trace', '5 trace test'],
			['warn', '6 warn test'],
		]);
	});
});
