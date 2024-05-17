export let buildContainer = <T,>(initialValue: NonNullable<T>) => {
	let currentValue: NonNullable<T> = initialValue;

	let get = (): NonNullable<T> => {
		return currentValue;
	};

	let set = (value: NonNullable<T>): void => {
		currentValue = value;
	};

	return {
		get,
		set,
	};
};

export type Container<T> = ReturnType<typeof buildContainer<T>>;
