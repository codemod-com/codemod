import { format } from 'node:util';
import { type ConsoleKind, parseConsoleKind } from '@codemod-com/printer';

export let buildVmConsole =
	(callback: (kind: ConsoleKind, message: string) => void) =>
	(k: unknown, data: unknown, ...args: unknown[]) => {
		let kind = parseConsoleKind(k);

		let message = format(data, ...args);

		callback(kind, message);
	};
