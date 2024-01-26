// eslint-disable-next-line @typescript-eslint/no-explicit-any
const throttle = <R>(callback: (...args: any[]) => R, ms: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	return (...args: any[]) => {
		if (timeout) {
			return;
		}

		callback(...args);
		timeout = setTimeout(() => {
			callback(...args);
			timeout = null;
		}, ms);
	};
};

export default throttle;
