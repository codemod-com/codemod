import { type Output, literal, parse, union } from 'valibot';

export let consoleKindSchema = union([
	literal('debug'),
	literal('error'),
	literal('log'),
	literal('info'),
	literal('trace'),
	literal('warn'),
]);

export let parseConsoleKind = (input: unknown) =>
	parse(consoleKindSchema, input);

export type ConsoleKind = Output<typeof consoleKindSchema>;
