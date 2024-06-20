import { PLazy } from '../PLazy.js';
import { getAstGrepNodeContext } from '../contexts.js';
import { fnWrapper, wrapContext } from '../engineHelpers.js';
import { wrapHelpers } from '../helpers.js';

export function mapLogic<
	CALLBACK extends (helpers: Helpers) => ReturnType<CALLBACK>,
	RETURN extends ReturnType<CALLBACK>,
>(callback: CALLBACK): Promise<RETURN[]> {
	let innerParentContext = wrapContext.getStore();

	let context = async (cb: any) => {
		let response = [] as RETURN[];

		await innerParentContext?.(async () => {
			let result = await cb(wrapHelpers(helpers, context));
			response.push(result);
			return result;
		});

		return response;
	};

	let promise = new PLazy<RETURN[]>((resolve, reject) => {
		context(callback).then(resolve).catch(reject);
	}) as PLazy<RETURN[]>;

	return promise;
}

export let map = fnWrapper('map', mapLogic);

let helpers = {
	getNode: () => getAstGrepNodeContext().node,
	getMatch: (m: string) => getAstGrepNodeContext().node.getMatch(m),
	getMultipleMatches: (m: string) =>
		getAstGrepNodeContext().node.getMultipleMatches(m),
};

type Helpers = typeof helpers;
