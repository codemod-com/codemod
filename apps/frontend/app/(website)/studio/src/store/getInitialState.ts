import type { ACCESS_TOKEN_COMMANDS } from "@/constants";
import type { KnownEngines } from "@codemod-com/utilities";
import type { EditorsSnippets } from "@studio/store/snippets";
import {
  getEmptyTestCase,
  getSingleTestCase,
  getSnippetInitialState,
  toInitialStates,
} from "@studio/store/utils/getSnippetInitialState";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import { prettify } from "@studio/utils/prettify";
import { inflate } from "pako";
import { map, pipe, zip, zipWith } from "ramda";
import { decode } from "universal-base64url";
import { parse } from "valibot";
import { parseShareableCodemod } from "../schemata/shareableCodemodSchemata";
import {
  editorsArraySchemata,
  editorsSchemata,
  editorsSnippetsSchema,
  parseState,
} from "../schemata/stateSchemata";

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
  engine: KnownEngines;
  codemodSource: string;
  codemodName: string | null;
  command: "learn" | AccessTokenCommands | null;
  editors: EditorsSnippets[];
}>;

const decodeNullable = (value: string | null): string | null => {
  if (value === null) {
    return value;
  }

  try {
    return decode(value);
  } catch (error) {
    return value;
  }
};

export const getInitialState = (): InitialState => {
  if (typeof window === "undefined") {
    return {
      engine: "jscodeshift",
      editors: [getEmptyTestCase()],
      codemodSource: "",
      codemodName: "",
      command: null,
    };
  }

  const searchParams = new URLSearchParams(window.location.search);

  const csc = searchParams.get(SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD);

  if (csc !== null) {
    try {
      const encryptedString = window.atob(
        csc.replaceAll("-", "+").replaceAll("_", "/"),
      );

      const numberArray = Array.from(encryptedString)
        .map((character) => character.codePointAt(0))
        .filter(isNeitherNullNorUndefined);

      const uint8Array = Uint8Array.from(numberArray);

      const decryptedString = inflate(uint8Array, { to: "string" });
      const shareableCodemod = parseShareableCodemod(
        JSON.parse(decryptedString),
      );

      const getMultipleEditors = ({
        before,
        after,
        names,
      }: {
        before: string[];
        after: string[];
        names: string[];
      }) => {
        const zipit = zipWith((before, after) => ({ before, after }));
        const zipitMore = zipWith(({ before, after }, name) => ({
          before,
          after,
          name: name ?? "test",
        }));
        return zipitMore(zipit(before, after), names);
      };

      const editors = shareableCodemod.bm
        ? getMultipleEditors({
            before: shareableCodemod.bm.split("__codemod_splitter__"),
            after: shareableCodemod.am.split("__codemod_splitter__"),
            names: shareableCodemod.nm.split("__codemod_splitter__"),
          })
        : [
            {
              name: "test 1",
              before: shareableCodemod.b ?? "",
              after: shareableCodemod.a ?? "",
            },
          ];

      return {
        engine: shareableCodemod.e ?? "jscodeshift",
        editors: editors.map(toInitialStates),
        codemodSource: shareableCodemod.c ?? "",
        codemodName: shareableCodemod.n ?? null,
        command: null,
      };
    } catch (error) {
      console.error(error);
    }
  }

  const engine = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.ENGINE),
  ) as KnownEngines;
  const diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
  const codemodSource = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_SOURCE),
  );
  const codemodName = decodeNullable(
    searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_NAME),
  );

  const command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

  const someSearchParamsSet = [
    engine,
    diffId,
    codemodSource,
    codemodName,
    command,
  ].some((s) => s !== null);

  if (someSearchParamsSet) {
    return {
      engine: engine ?? "jscodeshift",
      editors: [getEmptyTestCase()],
      codemodSource: codemodSource ?? "",
      codemodName: codemodName ?? "",
      command:
        command === "learn" || command === "accessTokenRequested"
          ? command
          : null,
    };
  }

  return {
    engine: "jscodeshift",
    editors: [getSingleTestCase()],
    codemodSource: buildDefaultCodemodSource("jscodeshift"),
    codemodName: null,
    command: null,
  };
};

// I don't like this being a global variable
// TODO pass this as a dependency when initializing redux
export const INITIAL_STATE = getInitialState();
