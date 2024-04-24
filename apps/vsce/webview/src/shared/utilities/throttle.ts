const throttle = <R>(callback: (...args: any[]) => R, ms: number) => {
	let timeout: ReturnType<typeof setTimeout> | null = null;

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
