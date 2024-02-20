import { File, Node, isFile, isStatement } from "@babel/types";
import { buildAST } from "ast-node-builder";

const stringifyNode = (node: Node): string => {
	return JSON.stringify(node, (key, value) => {
		if (["tokens", "loc", "start", "end", "extra"].includes(key)) {
			return undefined;
		}

		return value;
	});
};

export const buildFactoryCode = (node: Node): string => {
	const astNode: File | null = isFile(node)
		? node
		: isStatement(node)
		  ? {
					type: "File" as const,
					program: {
						type: "Program" as const,
						body: [node],
						directives: [],
						sourceType: "script",
						sourceFile: "afterSnippet.tsx",
					},
			  }
		  : null;

	if (astNode === null) {
		return stringifyNode(node);
	}

	const factoryCode = buildAST(astNode).join("");

	if (factoryCode === "") {
		return stringifyNode(node);
	}

	return factoryCode;
};
