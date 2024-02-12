// eslint-disable-next-line @typescript-eslint/ban-types
export const filterNeitherNullNorUndefined = <T>(value: T): value is T & {} =>
	value !== undefined && value !== null;
