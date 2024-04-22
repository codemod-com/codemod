import { STARTER_SNIPPET } from "@studio/store/getInitialState";
import { injectCFSOutputToCodemod } from "../../../utils/injectCFSOutputToCodemod";

const generateCodemodNamePrompt = (codemod: string) => `
You are a jscodeshift codemod and javascript expert. 
Come up with a precise, detailed variable name to be used for the following jscodeshift codemod below. 
Variable name should start with "handle". 
Do not return any text other than the variable name.
\`\`\`
${codemod}
\`\`\`
`;

// msw/2/name-of-mod
const generateCodemodHumanNamePrompt = (codemod: string) => `
You are a jscodeshift codemod and javascript expert. 
Come up with a precise name to be used for the following jscodeshift codemod below.
If the codemod is aimed at making any changes to a particular framework or library, the format
should be "framework/version/name", where framework is the name of the framework or library,
version is a major version (meaning one or two digits), and name is a short name for the codemod
written in kebab-case. If you can't determine which framework this is for, you can just return the name
written in kebab-case.
Do not return any text other than the codemod name.
\`\`\`
${codemod}
\`\`\`
`;

const autoGenerateCodemodPrompt = `
Below, you are provided with "Before" and "After" code snippets.
The code snippets are written in JavaScript or TypeScript language.

Before:
$BEFORE

After:
$AFTER

Consider the following jscodeshift codemod Template:
	
\`\`\`
import type { FileInfo, API, Options } from 'jscodeshift';
export default function transform(
	file: FileInfo,
	api: API,
	options?: Options,
): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);
	
	//jscodeshift codemod implementation
	
	return root.toSource();
}
\`\`\`
	
Write a jscodeshift codemod that transforms the "Before" code snippet into the "After" while adhering to the Template above and replace the "//jscodeshift codemod implementation" comment with actual codemod implementation.

Preserve the leading comments by using a helper function like this:

\`\`\`
function replaceWithComments(path, newNode) {
	// If the original node had comments, add them to the new node
	if (path.node.comments) {
		newNode.comments = path.node.comments;
	}

	// Replace the node
	j(path).replaceWith(newNode);
}
\`\`\`
 
 
You are only allowed to use jscodeshift library and TypeScript language.

Do not use any other libraries other than jscodeshift.

Your codemod should not contain any typescript errors and bugs.

Only provide the code. Do not share extra explanations.

Before accessing jscodeshift node properties, try to narrow node's type.

You can narrow node type by checking "type" property. Example:
	
\`\`\`
// ensures that node is Identifier
if(node.type === "Identifier") {
	// safely access properties of Identifier
}
\`\`\`

Try making your codemod modular.

Write comments with best practices in mind.

Never import namedTypes or builders from jscodeshift.
Only import jscodeshift in the codemod.

"VariableDeclarator" does not have a property "id".
"VariableDeclarator" does not have a property "init".
"Identifier" does not have a property "init".
"ExpressionKind" does not have a property "params".
"Identifier" does not have a property "params".
"PatternKind" does not have a property "name".
"RestElement" does not have a property "name".
"PatternKind" does not have a property "typeAnnotation".
"SpreadElementPattern" does not have a property "typeAnnotation".

Make sure the codemod you generate, FULLY and EXACTLY transforms the "Before" code snippet to the "After" code snippet.
- If the "After" code has additional import statements, make sure the codemod adds them.
- If the "After" code has fewer import statements, make sure the codemod removes them.
- If the "After" code has type annotations, make sure the codemod adds them.
`;

// fixBlock V1
// @TODO add ability to include debug info/ts-error text
const fixCodemodBlockNoDebugInfoPrompt = `
  Your codemod has error(s). 
	
  This code block of the codemod contains error(s). 
	$HIGHLIGHTED_IN_CODEMOD
	
	Fix this part and return the fixed version of it as response.
	
	Only provide the code. Do not share extra explanations.
 `;

type PromptPresetKind = "fixCodemod" | "autoGenerateCodemod" | "customPrompt";
type PromptPreset = {
	kind: PromptPresetKind;
	prompt: string;
	name: string;
	description: string;
};

interface ProcessPromptResponseStrategy {
	getCodemodFromLLMResponse(prevCodemod: string, responseText: string): string;
}

const overwriteAll = {
	getCodemodFromLLMResponse: (
		prevCodemod: string,
		responseText: string,
	): string =>
		STARTER_SNIPPET.replace(
			"{%DEFAULT_FIND_REPLACE_EXPRESSION%}",
			responseText,
		).replace("{%COMMENT%}", ""),
};

const insertAtTheTop = {
	getCodemodFromLLMResponse: (
		prevCodemod: string,
		responseText: string,
		// @TODO rename
	): string => injectCFSOutputToCodemod(prevCodemod, responseText) ?? "",
};

const promptStrategies: Readonly<
	Record<PromptPresetKind, ProcessPromptResponseStrategy>
> = {
	autoGenerateCodemod: overwriteAll,
	fixCodemod: overwriteAll,
	customPrompt: insertAtTheTop,
};

export type { PromptPreset };
export {
	promptStrategies,
	generateCodemodNamePrompt,
	generateCodemodHumanNamePrompt,
	autoGenerateCodemodPrompt,
	fixCodemodBlockNoDebugInfoPrompt,
};
