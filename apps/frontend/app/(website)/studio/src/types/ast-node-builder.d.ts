declare module "ast-node-builder" {
	import type { File } from "@babel/types";

	export function buildAST(fileNode: File): ReadonlyArray<string>;
}
