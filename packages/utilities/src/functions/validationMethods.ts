export const isNeitherNullNorUndefined = <T>(
	t: NonNullable<T> | null | undefined,
): t is NonNullable<T> => t !== null && t !== undefined;
