export function assertsNeitherNullNorUndefined<T extends {}>(
	value: T | null | undefined,
): asserts value is T {
	if (value === null || value === undefined) {
		throw new Error("The provided value is either null nor undefined");
	}
}
