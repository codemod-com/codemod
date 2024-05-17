import { exec } from 'node:child_process';
import { promisify } from 'node:util';

export let execPromise = promisify(exec);

export let sleep = (ms: number) =>
	new Promise((resolve) => setTimeout(resolve, ms));

export let isGeneratorEmpty = async (
	genFunc: () => AsyncGenerator<unknown> | Generator<unknown>,
) => {
	let tempGen = genFunc();
	let { done } = await tempGen.next();

	return done;
};
