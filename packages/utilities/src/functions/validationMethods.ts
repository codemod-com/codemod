export const isNeitherNullNorUndefined = <T>(
	t: NonNullable<T> | null | undefined,
): t is NonNullable<T> => t !== null && t !== undefined;

export const assertsNeitherNullOrUndefined = <T>(
	value: T,
): asserts value is T & {} => {
	if (value === null || value === undefined) {
		throw new Error("The value cannot be null or undefined");
	}
};
