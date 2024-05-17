import type { ACCESS_TOKEN_COMMANDS } from "@/constants";
import type { KnownEngines } from "@codemod-com/utilities";
import { isNeitherNullNorUndefined } from "@studio/utils/isNeitherNullNorUndefined";
import { prettify } from "@studio/utils/prettify";
import { inflate } from "pako";
import { decode } from "universal-base64url";
import { parseShareableCodemod } from "../schemata/shareableCodemodSchemata";
import { parseState } from "../schemata/stateSchemata";

export let BEFORE_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state) {
    const { data } = state;
    return {
        data,
    };
}
 `;

export let AFTER_SNIPPET_DEFAULT_CODE = `function mapStateToProps(state: State) {
    const { data } = state;
    return {
        data,
    };
}
`;

export let DEFAULT_FIND_REPLACE_EXPRESSION = `
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

export let STARTER_SNIPPET = `// BELOW IS A SAMPLE CODEMOD. BUILD YOUR OWN:
// 1. INPUT: Fill out the Before and After editors with sample code snippets as test fixtures.
// 2. AI: In the ModGPT tab on the left, click the button: "Build a codemod to transform before to after"
// 3. OUTPUT: Let AI generate your codemod. Once generated, copy and paste it here.
   // This studio features a live codemod runner, so you can immediately see how your codemod transforms the "Before" snippet once pasted below.


import type { FileInfo, API, Options } from 'jscodeshift';

export default function transform(
    file: FileInfo,
    api: API,
		options?: Options,
): string | undefined {
    const j = api.jscodeshift;
    const root = j(file.source);
    {%DEFAULT_FIND_REPLACE_EXPRESSION%}
	{%COMMENT%}
    return root.toSource();
};`;

export let TSMORPH_STARTER_SNIPPET = `
import { SourceFile, EmitHint } from "ts-morph";

export const handleSourceFile = (
	sourceFile: SourceFile
): string | undefined => {
	return sourceFile.print({ emitHint: EmitHint.SourceFile });
}
`;

export let buildDefaultCodemodSource = (engine: KnownEngines) => {
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

export let SEARCH_PARAMS_KEYS = Object.freeze({
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
  beforeSnippet: string;
  afterSnippet: string;
  codemodSource: string;
  codemodName: string | null;
  command: "learn" | AccessTokenCommands | null;
}>;

let decodeNullable = (value: string | null): string | null => {
  if (value === null) {
    return value;
  }

  try {
    return decode(value);
  } catch (error) {
    return value;
  }
};

export let getInitialState = (): InitialState => {
  {
    if (typeof window === "undefined") {
      return {
        engine: "jscodeshift",
        beforeSnippet: "",
        afterSnippet: "",
        codemodSource: "",
        codemodName: "",
        command: null,
      };
    }

    let searchParams = new URLSearchParams(window.location.search);

    let csc = searchParams.get(
      SEARCH_PARAMS_KEYS.COMPRESSED_SHAREABLE_CODEMOD,
    );

    if (csc !== null) {
      try {
        let encryptedString = window.atob(
          csc.replaceAll("-", "+").replaceAll("_", "/"),
        );

        let numberArray = Array.from(encryptedString)
          .map((character) => character.codePointAt(0))
          .filter(isNeitherNullNorUndefined);

        let uint8Array = Uint8Array.from(numberArray);

        let decryptedString = inflate(uint8Array, { to: "string" });
        let shareableCodemod = parseShareableCodemod(
          JSON.parse(decryptedString),
        );

        return {
          engine: shareableCodemod.e ?? "jscodeshift",
          beforeSnippet: shareableCodemod.b ?? "",
          afterSnippet: shareableCodemod.a ?? "",
          codemodSource: shareableCodemod.c ?? "",
          codemodName: shareableCodemod.n ?? null,
          command: null,
        };
      } catch (error) {
        console.error(error);
      }
    }

    let engine = decodeNullable(
      searchParams.get(SEARCH_PARAMS_KEYS.ENGINE),
    ) as KnownEngines;
    let diffId = searchParams.get(SEARCH_PARAMS_KEYS.DIFF_ID);
    let codemodSource = decodeNullable(
      searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_SOURCE),
    );
    let codemodName = decodeNullable(
      searchParams.get(SEARCH_PARAMS_KEYS.CODEMOD_NAME),
    );

    let command = searchParams.get(SEARCH_PARAMS_KEYS.COMMAND);

    let someSearchParamsSet = [
      engine,
      diffId,
      codemodSource,
      codemodName,
      command,
    ].some((s) => s !== null);

    if (someSearchParamsSet) {
      return {
        engine: engine ?? "jscodeshift",
        beforeSnippet: "",
        afterSnippet: "",
        codemodSource: codemodSource ?? "",
        codemodName: codemodName ?? "",
        command:
          command === "learn" || command === "accessTokenRequested"
            ? command
            : null,
      };
    }
  }

  let stringifiedState = localStorage.getItem("state");

  if (stringifiedState !== null) {
    try {
      let state = parseState(JSON.parse(stringifiedState));

      let everyValueIsEmpty = [
        state.afterSnippet,
        state.beforeSnippet,
        state.codemodSource,
      ].every((s) => s === "");

      let beforeSnippet = everyValueIsEmpty
        ? BEFORE_SNIPPET_DEFAULT_CODE
        : state.beforeSnippet;

      let afterSnippet = everyValueIsEmpty
        ? AFTER_SNIPPET_DEFAULT_CODE
        : state.afterSnippet;

      let codemodSource = everyValueIsEmpty
        ? buildDefaultCodemodSource(state.engine)
        : state.codemodSource;

      return {
        engine: state.engine,
        beforeSnippet,
        afterSnippet,
        codemodSource,
        codemodName: null,
        command: null,
      };
    } catch (error) {
      console.error(error);
    }
  }

  return {
    engine: "jscodeshift" as const,
    beforeSnippet: BEFORE_SNIPPET_DEFAULT_CODE,
    afterSnippet: AFTER_SNIPPET_DEFAULT_CODE,
    codemodSource: buildDefaultCodemodSource("jscodeshift"),
    codemodName: null,
    command: null,
  };
};

// I don't like this being a global variable
// TODO pass this as a dependency when initializing redux
export let INITIAL_STATE = getInitialState();
