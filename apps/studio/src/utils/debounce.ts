export const debounce = <T, R>(callback: (arg1: T) => R, ms: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (arg1: T) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => callback(arg1), ms);
	};
};
