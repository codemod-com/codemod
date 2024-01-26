import type core from 'jscodeshift';
import type { Collection } from 'jscodeshift';

export type ModifyFunction = <T>(
	root: Collection<T>,
	j: core.JSCodeshift,
) => void;
