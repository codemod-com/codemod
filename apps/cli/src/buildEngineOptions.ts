import type { Codemod } from '@codemod-com/runner';
import { type EngineOptions, parseEngineOptions } from '@codemod-com/utilities';

export let buildCodemodEngineOptions = (
	engine: Codemod['engine'],
	rawArgumentRecord: Record<string, unknown>,
): EngineOptions | null => {
	let options = parseEngineOptions({ engine, ...rawArgumentRecord });

	if (!options.success) {
		return null;
	}

	return options.output;
};
