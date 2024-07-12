import type { ACCESS_TOKEN_COMMANDS } from "@/constants";
import type { KnownEngines } from "@codemod-com/utilities";
import { isServer } from "@studio/config";
import type { EditorsSnippets } from "@studio/store/snippets";
import { getSingleTestCase } from "@studio/store/utils/getSnippetInitialState";
import { prettify } from "@studio/utils/prettify";

export const BEFORE_SNIPPET_DEFAULT_CODE = `const [a, b] = await Promise.all([
    Promise.resolve('a'),
    isFlagEnabled('featureFlag'),
]);
const x = b && c;
const y = <A b={b} />;
 `;

export const AFTER_SNIPPET_DEFAULT_CODE = `const a = await Promise.resolve('a');
const x = c;
const y = <A b={true} />;
`;

export const DEFAULT_FIND_REPLACE_EXPRESSION = `
root.find(j.FunctionDeclaration, {
    id: {
        name: 'mapStateToProps',
        type: 'Identifier',
    },
}).forEach((functionDeclarationPath) => {
    if (functionDeclarationPath.value.params.length === 0) {
        return;
    }

    const collection = j(functionDeclarationPath);
    collection.forEach((astPath) => {
        const patternKind = astPath.value.params[0];
        if (patternKind?.type !== 'Identifier') {
            return;
        }
        const identifierPathCollection = j(astPath).find(j.Identifier, {
            name: patternKind.name,
        });
        const typeAnnotation = j.typeAnnotation(
            j.genericTypeAnnotation(j.identifier('State'), null),
        );

        identifierPathCollection.paths()[0]?.replace(
            j.identifier.from({
                comments: patternKind.comments ?? null,
                name: patternKind.name,
                optional: patternKind.optional,
                typeAnnotation: typeAnnotation,
            }),
        );
    });
});`;

export const STARTER_SNIPPET = `// BELOW IS A SAMPLE CODEMOD. BUILD YOUR OWN:
// 1. INPUT: Fill out the Before and After editors with sample code snippets as test fixtures.
// 2. AI: In the ModGPT tab on the left, click the button: "Autogenerate with AI" or "Autogenerate with Codemod AI"
// 3. OUTPUT: Let AI generate your codemod. Once generated, copy and paste it here.
// This studio features a live codemod runner, so you can immediately see how your codemod transforms the "Before" snippet once pasted below.

import type { API, FileInfo, Options } from 'jscodeshift';

export default function transform(file: FileInfo, api: API, options: Options): string | undefined {
    const functionName = String(options.functionName ?? 'isFlagEnabled');
    const featureFlagName = String(options.featureFlagName ?? 'featureFlag');

    let dirtyFlag = false;

    const j = api.jscodeshift;
    const root = j(file.source);

    root.find(j.CallExpression, {
        type: 'CallExpression',
        callee: {
            type: 'Identifier',
            name: functionName,
        },
        arguments: [
            {
                type: 'StringLiteral' as const,
                value: featureFlagName,
            },
        ],
    }).replaceWith(() => {
        dirtyFlag = true;

        return {
            type: 'BooleanLiteral',
            value: true,
        };
    });

    root.find(j.VariableDeclarator, {
        type: 'VariableDeclarator',
        id: {
            type: 'ArrayPattern',
        },
        init: {
            type: 'AwaitExpression',
            argument: {
                type: 'CallExpression',
                callee: {
                    type: 'MemberExpression',
                    object: {
                        type: 'Identifier',
                        name: 'Promise',
                    },
                    property: {
                        type: 'Identifier',
                        name: 'all',
                    },
                },
                arguments: [
                    {
                        type: 'ArrayExpression' as const,
                    },
                ],
            },
        },
    }).forEach((variableDeclarator) => {
        const { node } = variableDeclarator;

        if (node.id.type !== 'ArrayPattern') {
            return;
        }

        if (node.init?.type !== 'AwaitExpression') {
            return;
        }

        if (node.init.argument?.type !== 'CallExpression') {
            return;
        }

        if (node.init.argument.arguments[0]?.type !== 'ArrayExpression') {
            return;
        }

        const indices: number[] = [];

        const { elements } = node.init.argument.arguments[0];

        elements.forEach((element, index) => {
            if (element?.type === 'BooleanLiteral' && element.value) {
                indices.push(index);
            }
        });

        if (indices.length === 0) {
            return;
        }

        dirtyFlag = true;

        const identifierNames: string[] = [];

        node.id.elements
            .filter((_, index) => indices.some((i) => index === i))
            .forEach((element) => {
                if (element?.type === 'Identifier') {
                    identifierNames.push(element.name);
                }
            });

        node.id.elements = node.id.elements.filter(
            (_, index) => !indices.some((i) => index === i),
        );

        node.init.argument.arguments[0].elements = elements.filter(
            (_, index) => !indices.some((i) => index === i),
        );

        if (node.id.elements.length === 1) {
            const [elementId] = node.id.elements;
            const [initElement] = node.init.argument.arguments[0].elements;

            if (
                elementId &&
                elementId.type !== 'SpreadElement' &&
                initElement &&
                initElement.type !== 'RestElement' &&
                initElement.type !== 'SpreadElement'
            ) {
                node.id = elementId;

                node.init = {
                    type: 'AwaitExpression',
                    argument: initElement,
                };
            }
        }

        const scope = variableDeclarator._computeScope();

        if (!scope?.path) {
            return;
        }

        identifierNames.forEach((name) => {
            j(scope.path)
                .find(j.Identifier, { name })
                .filter((path) => {
                    const parent = path._computeParent();

                    if (!parent || !('value' in parent)) {
                        return true;
                    }

                    return parent.value?.type !== 'JSXAttribute';
                })
                .replaceWith(() => {
                    dirtyFlag = true;

                    return {
                        type: 'BooleanLiteral',
                        value: true,
                    };
                });
        });
    });

    root.find(j.LogicalExpression, {
        type: 'LogicalExpression',
        left: {
            type: 'BooleanLiteral',
            value: true,
        },
        operator: '&&',
    }).replaceWith(({ node }) => {
        dirtyFlag = true;

        return node.right;
    });

    root.find(j.LogicalExpression, {
        type: 'LogicalExpression',
        right: {
            type: 'BooleanLiteral',
            value: true,
        },
        operator: '&&',
    }).replaceWith(({ node }) => {
        dirtyFlag = true;

        return node.left;
    });

    root.find(j.AwaitExpression, {
        type: 'AwaitExpression',
        argument: {
            type: 'BooleanLiteral',
        },
    }).replaceWith(({ node }) => {
        dirtyFlag = true;

        return node.argument;
    });

    return dirtyFlag ? root.toSource() : undefined;
}
`;

export const TSMORPH_STARTER_SNIPPET = `
import { SourceFile, EmitHint } from "ts-morph";

export const handleSourceFile = (
	sourceFile: SourceFile
): string | undefined => {
	return sourceFile.print({ emitHint: EmitHint.SourceFile });
}
`;

export const buildDefaultCodemodSource = (engine: KnownEngines) => {
  if (engine === "jscodeshift") {
    return prettify(
      STARTER_SNIPPET.replace(
        "{%DEFAULT_FIND_REPLACE_EXPRESSION%}",
        DEFAULT_FIND_REPLACE_EXPRESSION,
      ).replace("{%COMMENT%}", ""),
    );
  }

  return TSMORPH_STARTER_SNIPPET;
};

export const SEARCH_PARAMS_KEYS = Object.freeze({
  ENGINE: "engine" as const,
  DIFF_ID: "diffId" as const,
  CODEMOD_SOURCE: "codemodSource" as const,
  CODEMOD_NAME: "codemodName" as const,
  COMMAND: "command" as const,
  COMPRESSED_SHAREABLE_CODEMOD: "c" as const,
  ACCESS_TOKEN: "accessToken" as const,
  SESSION_ID: "sessionId" as const,
  IV: "iv" as const,
});

type AccessTokenCommands = (typeof ACCESS_TOKEN_COMMANDS)[number];

type InitialState = Readonly<{
  legacyLS?: boolean;
  engine: KnownEngines;
  codemodSource: string;
  codemodName: string | null;
  command: "learn" | AccessTokenCommands | null;
  editors: EditorsSnippets[];
}>;

export const INITIAL_STATE: InitialState = {
  engine: "jscodeshift",
  editors: [getSingleTestCase()],
  codemodSource: isServer ? "" : buildDefaultCodemodSource("jscodeshift"),
  codemodName: null,
  command: null,
};
