declare module 'ast-node-builder' {
	import type { File } from '@babel/types';

	// eslint-disable-next-line import/prefer-default-export
	export function buildAST(fileNode: File): ReadonlyArray<string>;
}
