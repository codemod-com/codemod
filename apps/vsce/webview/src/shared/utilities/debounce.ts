// eslint-disable-next-line @typescript-eslint/no-explicit-any
const debounce = <R>(callback: (...args: any[]) => R, ms: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		if (timeout !== null) {
			clearTimeout(timeout);
		}

		timeout = setTimeout(() => callback(...args), ms);
	};
};

export default debounce;
