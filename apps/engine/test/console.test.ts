import { deepStrictEqual } from 'node:assert';
import { describe, it } from 'vitest';
import vm from 'node:vm';
import { ConsoleKind } from '../src/schemata/consoleKindSchema.js';
import { buildVmConsole } from '../src/buildVmConsole.js';
import { CONSOLE_OVERRIDE } from '../src/consoleOverride.js';

describe('console', () => {
	it('should pick the console statements from the VM', async () => {
		const codeToExecute = `
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

		const messages: [ConsoleKind, string][] = [];

		const customCallback = (kind: ConsoleKind, message: string) => {
			messages.push([kind, message]);
		};

		const exports = {};

		const context = vm.createContext({
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
