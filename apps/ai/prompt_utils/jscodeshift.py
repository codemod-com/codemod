engine = 'jscodeshift'

postfix = """
Here are examples of valid codemods that are written for example BEFORE and AFTER code snippets:

Example 1:

Example 1 BEFORE:
```
import createHistory from 'history/createBrowserHistory';
const history = createHistory();
history.listenBefore((location) => {
    console.log(location);
});
```

Example 1 AFTER:
```
import createHistory from 'history/createBrowserHistory';
const history = createHistory();
history.block(({ location }) => {
    console.log(location);
});
```

Example 1 codemod:
```typescript
import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);

	root
		.find(j.CallExpression, {
			callee: {
				type: "MemberExpression",
				object: { name: "history" },
				property: { name: "listenBefore" },
			},
		})
		.forEach((path) => {
			const identifierPath = j(path)
				.find(j.Identifier, { name: "listenBefore" })
				.paths()
				.at(0);

			if (!identifierPath) {
				return;
			}

			identifierPath.value.name = "block";
			const arg = path.value.arguments[0];
			if (!j.ArrowFunctionExpression.check(arg)) {
				return;
			}

			const [locationNode, callbackNode] = arg.params;
			const properties = [];

			if (locationNode) {
				properties.push(
					j.objectProperty.from({
						key: j.identifier("location"),
						value: j.identifier("location"),
						shorthand: true,
					}),
				);
			}

			if (callbackNode) {
				properties.push(
					j.objectProperty.from({
						key: j.identifier("action"),
						value: j.identifier("action"),
						shorthand: true,
					}),
				);
			}

			if (properties.length === 0) {
				return;
			}

			const objectPattern = j.objectPattern.from({
				properties,
			});

			arg.params = [objectPattern];

			if (j.Identifier.check(callbackNode)) {
				const callbackName = callbackNode.name;
				j(path)
					.find(j.Identifier, {
						type: "Identifier",
						name: callbackName,
					})
					.forEach((path) => {
						path.replace(j.identifier.from({ name: "action" }));
					});
			}
		});

	return root.toSource();
}

export default transform;
```

Example 2:

Example 2 BEFORE:
```
import { Route, Router } from 'react-router-dom';
const MyApp = () => (
    <Router history={history}>
        <Route path='/posts' component={PostList} />
        <Route path='/posts/:id' component={PostEdit} />
        <Route path='/posts/:id/show' component={PostShow} />
        <Route path='/posts/:id/delete' component={PostDelete} />
    </Router>
);
```

Example 2 AFTER:
```
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
```

Example 2 codemod:
```typescript
import type { API, FileInfo, Options, Transform } from "jscodeshift";

function transform(
	file: FileInfo,
	api: API,
	options: Options,
): string | undefined {
	const j = api.jscodeshift;

	const root = j(file.source);

	let dirtyFlag = false;

	root
		.find(j.JSXElement, {
			openingElement: { name: { name: "Router" } },
		})
		.forEach((path) => {
			const hasSwitch = root.findJSXElements("Switch").length > 0;

			if (hasSwitch) {
				return;
			}

			const children = path.value.children;
			const newEl = j.jsxElement(
				j.jsxOpeningElement(j.jsxIdentifier("Switch"), [], false),
				j.jsxClosingElement(j.jsxIdentifier("Switch")),
				children,
			);

			path.value.children = [j.jsxText("\n  "), newEl, j.jsxText("\n")];
			dirtyFlag = true;
		});

	if (!dirtyFlag) {
		return undefined;
	}

	return root.toSource(options);
}

export default transform;
```


Example 3:

Example 3 BEFORE:
```
import { Redirect, Route } from 'react-router';
```

Example 3 AFTER:
```
import { Redirect, Route } from 'react-router-dom';
```

Example 3 codemod:
```typescript
import type { API, FileInfo, Options, Transform } from 'jscodeshift';

function transform(
    file: FileInfo,
    api: API,
    options: Options,
): string | undefined {
    const j = api.jscodeshift;

    const root = j(file.source);

    let dirtyFlag = false;

    root.find(j.ImportDeclaration, {
        source: { value: 'react-router' },
    }).forEach((path) => {
        path.value.source.value = 'react-router-dom';

        dirtyFlag = true;
    });

    if (!dirtyFlag) {
        return undefined;
    }

    return root.toSource(options);
}

export default transform;
```

Never import 'namedTypes' or 'builders' from 'jscodeshift'.
"""

initial_prompt_template = """
Below, you are provided with BEFORE and AFTER code snippets.

BEFORE:

```
[[[BEFORE]]]
```
		

AFTER:

```
[[[AFTER]]]
```

Write a [[[CODEMOD_ENGINE]]] codemod that transforms the BEFORE code snippet into the AFTER code snippet.

You are only allowed to use [[[CODEMOD_ENGINE]]] library and TypeScript language.

Before accessing [[[CODEMOD_ENGINE]]] node properties, try to narrow node's type.

You can narrow node type by checking "type" property. Example:
```
// ensures that node is Identifier
if(node.type === "Identifier") {
	// safely access properties of Identifier
}
```

The response must only contain a code block and no extra explanations.

Write comments with best practices in mind.

[[[POSTFIX]]]
"""

def get_initial_prompt(before, after):
    prompt = initial_prompt_template.replace("[[[BEFORE]]]", before.strip()) \
                            .replace("[[[AFTER]]]", after.strip()) \
                            .replace("[[[CODEMOD_ENGINE]]]", engine.strip()) \
                            .replace("[[[POSTFIX]]]", postfix.strip())
    return prompt

system_instructions = 'You are an expert in code migrations, jscodeshift, and typescript. You will help the user write a codemod using jscodeshift given a pair of a before and an after code snippet.'
