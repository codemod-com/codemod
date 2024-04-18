export const filterNeitherNullNorUndefined = <T>(value: T): value is T & {} =>
	value !== undefined && value !== null;
