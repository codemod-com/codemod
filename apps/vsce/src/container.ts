export const buildContainer = <T>(initialValue: NonNullable<T>) => {
	let currentValue: NonNullable<T> = initialValue;

	const get = (): NonNullable<T> => {
		return currentValue;
	};

	const set = (value: NonNullable<T>): void => {
		currentValue = value;
	};

	return {
		get,
		set,
	};
};

export type Container<T> = ReturnType<typeof buildContainer<T>>;
