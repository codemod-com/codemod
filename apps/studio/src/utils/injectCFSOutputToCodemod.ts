import { prettify } from "./prettify";

const CommentForGeneratedOutput = `
//// Generated Output from CFS ////
`;

const CommentForEndOfGeneratedOutput = `
//// End of Generated Output from CFS ////
`;
export const injectCFSOutputToCodemod = (
	codemod?: string,
	cfsOutput?: string,
) => {
	if (!cfsOutput) return null;
	if (!codemod) return null;
	const match = codemod.match(/const root(.*)\n/g);

	if (match && match[0]) {
		const firstMatch = match[0];
		const firstMatchIndex = codemod.indexOf(firstMatch);
		const beforeContent = codemod.slice(
			0,
			firstMatchIndex + firstMatch.length,
		);
		const afterContent = codemod.slice(firstMatchIndex + firstMatch.length);
		const newContent = `${beforeContent}${CommentForGeneratedOutput}${cfsOutput}${CommentForEndOfGeneratedOutput}${afterContent}`;
		return prettify(newContent);
	}
	return null;
};
