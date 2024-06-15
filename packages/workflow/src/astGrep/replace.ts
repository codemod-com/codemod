import type { PLazy } from '../PLazy.js';
import { getAstGrepNodeContext } from '../contexts.js';
import { FunctionExecutor, fnWrapper } from '../engineHelpers.js';
import { map } from './map.js';

let callbackHelpers = {
	getNode: () => getAstGrepNodeContext().node,
	getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
	getMultipleMatches: (m: string) =>
		getAstGrepNodeContext().node.getMultipleMatches(m),
};

export function replaceLogic(
	callback: (
		helpers: typeof callbackHelpers,
	) => Promise<string | undefined> | string | undefined,
): PLazy<Helpers> & Helpers;
export function replaceLogic(
	rawReplacement: string | Readonly<string[]>,
): PLazy<Helpers> & Helpers;
export function replaceLogic(
	replacementOrCallback:
		| string
		| Readonly<string[]>
		| ((
				helpers: typeof callbackHelpers,
		  ) => Promise<string | undefined> | string | undefined),
): PLazy<Helpers> & Helpers {
	return new FunctionExecutor('replace')
		.arguments(() => {
			let replacement: string | undefined;
			if (typeof replacementOrCallback === 'string') {
				replacement = replacementOrCallback;
			} else if (Array.isArray(replacementOrCallback)) {
				replacement = replacementOrCallback.join('');
			}

			let callback =
				typeof replacementOrCallback === 'function'
					? replacementOrCallback
					: undefined;

			return { replacement, callback };
		})
		.helpers(() => helpers)
		.return((self) => self.wrappedHelpers())
		.executor(async (_next, self) => {
			let { node } = getAstGrepNodeContext();
			let { callback, replacement } = self.getArguments();
			if (callback) {
				replacement = await callback(self.wrapHelpers(callbackHelpers));
			}

			if (replacement) {
				let text = replacement.replace(
					/(\$\$)?\$([A-Z]+)/gm,
					// @ts-ignore
					(match, isMultiMatch, varName) => {
						if (isMultiMatch) {
							return node
								?.getMultipleMatches(varName)
								.map((n) => n.text())
								.join(' ');
						}

						return node.getMatch(varName)?.text() || '';
					},
				);

				let range = node.range();

				getAstGrepNodeContext().contents.update(
					range.start.index,
					range.end.index,
					text,
				);
			}
		})
		.run();
}

export let replace = fnWrapper('replace', replaceLogic);

let helpers = { map };

type Helpers = typeof helpers;
