import { STARTER_SNIPPET } from "@studio/store/getInitialState";
import { injectCFSOutputToCodemod } from "@studio/utils/injectCFSOutputToCodemod";

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

const autoGenerateCodemodPrompt = `### Context
- You will be provided with BEFORE and AFTER code snippets.
- Write a single jscodeshift codemod that transforms each BEFORE snippet into the AFTER snippet.
- Identify common patterns and create a generic codemod to handle all cases.
- Use only jscodeshift and TypeScript.
- If comments in AFTER snippets describe the transformation, do not preserve them.
- Only include a code block in your response, no extra explanations.
- Comment your code following best practices.
- Do not import 'namedTypes' or 'builders' from jscodeshift.
- Always narrow node types using typeguards before accessing their properties.

Here are two examples of using typeguards to check whether the import source is a string literal:
\`\`\`typescript
if (j.Literal.check(node.source)) { // CORRECT
  // rest of the code
}

if (j.Literal.check(node.source) && typeof node.source.value === 'string') { // CORRECT
  // rest of the code
}
\`\`\`


- Never check the node type without using typeguards. The following example is INCORRECT:
\`\`\`typescript
if (node.source.type === 'Literal') { // INCORRECT
  // rest of the code
}
\`\`\`


### Input Snippets


**BEFORE**:
\`\`\`typescript
$BEFORE
\`\`\`
**AFTER**:
\`\`\`typescript
$AFTER
\`\`\`


### Examples
#### Example 1
**BEFORE**:
\`\`\`typescript
import { A } from '@ember/array';
let arr = new A();
\`\`\`
**AFTER**:
\`\`\`typescript
import { A as emberA } from '@ember/array';
let arr = A();
\`\`\`
**CODEMOD**:
\`\`\`typescript
export default function transform(file, api) {
    const j = api.jscodeshift;
    const root = j(file.source);
    root.find(j.NewExpression, { callee: { name: "A" } }).replaceWith(() => {
        root.find(j.ImportSpecifier, {
            imported: { name: "A" },
            local: { name: "A" }
        }).replaceWith(() => {
            return j.importSpecifier(j.identifier("A"), j.identifier("emberA"));
        });
        return j.callExpression(j.identifier("A"), []);
    });
    return root.toSource();
}
\`\`\`

#### Example 2
**BEFORE**:
\`\`\`typescript
import { Route, Router } from 'react-router-dom';
const MyApp = () => (
    <Router history={history}>
        <Route path='/posts' component={PostList} />
        <Route path='/posts/:id' component={PostEdit} />
        <Route path='/posts/:id/show' component={PostShow} />
        <Route path='/posts/:id/delete' component={PostDelete} />
    </Router>
);
\`\`\`
**AFTER**:
\`\`\`typescript
import { Route, Router } from 'react-router-dom';
const MyApp = () => (
    <Router history={history}>
        <Switch>
            <Route path='/posts' component={PostList} />
            <Route path='/posts/:id' component={PostEdit} />
            <Route path='/posts/:id/show' component={PostShow} />
            <Route path='/posts/:id/delete' component={PostDelete} />
        </Switch>
    </Router>
);
\`\`\`
**CODEMOD**:
\`\`\`typescript
import type { API, FileInfo, Options, Transform } from "jscodeshift";
function transform(file: FileInfo, api: API, options: Options): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);
	root.find(j.JSXElement, {
		openingElement: { name: { name: "Router" } }
	}).forEach((path) => {
		const hasSwitch = root.findJSXElements("Switch").length > 0;
		if (hasSwitch) {
			return;
		}
		const children = path.value.children;
		const newEl = j.jsxElement(
			j.jsxOpeningElement(j.jsxIdentifier("Switch"), [], false),
			j.jsxClosingElement(j.jsxIdentifier("Switch")),
			children
		);
		path.value.children = [j.jsxText("\\n  "), newEl, j.jsxText("\\n")];
	});
	return root.toSource(options);
}
export default transform;
\`\`\`

#### Example 3
**BEFORE**:
\`\`\`typescript
import { Redirect, Route } from 'react-router';
\`\`\`
**AFTER**:
\`\`\`typescript
import { Redirect, Route } from 'react-router-dom';
\`\`\`
**CODEMOD**:
\`\`\`typescript
import type { API, FileInfo, Options, Transform } from 'jscodeshift';
function transform(file: FileInfo, api: API, options: Options): string | undefined {
	const j = api.jscodeshift;
	const root = j(file.source);
	root.find(j.ImportDeclaration, {
		source: { value: 'react-router' }
	}).forEach((path) => {
		path.value.source.value = 'react-router-dom';
	});
	return root.toSource(options);
}
export default transform;
\`\`\`

## Additional API about jscodeshift
### closestScope: Finds the closest enclosing scope of a node. Useful for determining the scope context of variables and functions.
\`\`\`typescript
const closestScopes = j.find(j.Identifier).closestScope();
\`\`\`

### some: checks if at least one element in the collection passes the test implemented by the provided function.
\`\`\`typescript
const hasVariableA = root.find(j.VariableDeclarator).some(path => path.node.id.name === 'a');
\`\`\`

### map: Maps each node in the collection to a new value.
\`\`\`typescript
const variableNames = j.find(j.VariableDeclaration).map(path => path.node.declarations.map(decl => decl.id.name));
\`\`\`

### paths: Returns the paths of the found nodes.
\`\`\`typescript
const paths = j.find(j.VariableDeclaration).paths();
\`\`\`

### get: Gets the first node in the collection.
\`\`\`typescript
const firstVariableDeclaration = j.find(j.VariableDeclaration).get();
\`\`\`

### at: Navigates to a specific path in the AST.
\`\`\`typescript
const secondVariableDeclaration = j.find(j.VariableDeclaration).at(1);
\`\`\`

### isOfType: checks if the node in the collection is of a specific type.
\`\`\`typescript
const isVariableDeclarator = root.find(j.VariableDeclarator).at(0).isOfType('VariableDeclarator');
\`\`\`
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
