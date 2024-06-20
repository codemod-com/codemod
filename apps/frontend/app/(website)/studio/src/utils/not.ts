export const not =
	<F extends (...args: any) => any>(f: F) =>
		(x: Parameters<F>) =>
			!f(x);
