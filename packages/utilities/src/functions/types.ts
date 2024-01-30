export type IntuitaRange = Readonly<[number, number, number, number]>;

export type DistributiveOmit<T, K extends keyof T> = T extends unknown
	? Omit<T, K>
	: never;
