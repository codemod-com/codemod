import type { Filemod, UnifiedFileSystem } from "@codemod-com/filemod";
import type {
  CallExpression,
  ImportDeclaration,
  ImportSpecifier,
  JsxOpeningElement,
  JsxSelfClosingElement,
  SourceFile,
  TemplateExpression,
} from "ts-morph";
import tsmorph, { Node, SyntaxKind } from "ts-morph";

type Dependencies = Readonly<{
  tsmorph: typeof tsmorph;
  unifiedFileSystem: UnifiedFileSystem;
}>;

const isNotSnakeCase = (str: string) => {
  return /^[a-z]+(_[a-z]+)*$/.test(str);
};

const TRANSLATION_FUNCTION_NAMES = [
  "t",
  "language",
  "translate",
  "getTextBody",
] as const;
type TranslationFunctionNames = (typeof TRANSLATION_FUNCTION_NAMES)[number];

const isTranslationFunctionName = (
  str: string,
): str is TranslationFunctionNames =>
  TRANSLATION_FUNCTION_NAMES.includes(str as TranslationFunctionNames);

const getValidTemplateHeadText = (
  expression: TemplateExpression,
): string | null => {
  const { text } = expression.getHead().compilerNode;

  return text.length !== 0 ? text : null;
};

const getValidTemplateTailText = (
  expression: TemplateExpression,
): string | null => {
  const spans = expression.getTemplateSpans();

  const lastSpan = spans[spans.length - 1] ?? null;

  if (lastSpan === null) {
    return null;
  }

  const literal = lastSpan.getLiteral();

  if (!Node.isTemplateTail(literal)) {
    return null;
  }

  const { text } = literal.compilerNode;

  return text.length !== 0 ? text : null;
};

const addTemplateHeadTextToKeyHeads = (
  state: State,
  templateExpression: TemplateExpression,
) => {
  const text = getValidTemplateHeadText(templateExpression);

  if (text !== null) {
    state.keyHeads.add(text);
  }
};

const addTemplateTailTextToKeyTails = (
  state: State,
  templateExpression: TemplateExpression,
) => {
  const text = getValidTemplateTailText(templateExpression);

  if (text !== null) {
    state.keyTails.add(text);
  }
};

const handleJSXElement = (
  element: JsxSelfClosingElement | JsxOpeningElement,
  state: State,
) => {
  const attributes = element.getAttributes();

  attributes.forEach((attribute) => {
    const propValueNode = attribute.getFirstChildByKind(
      SyntaxKind.StringLiteral,
    );

    if (propValueNode) {
      const propValue = propValueNode.getLiteralValue();
      if (isNotSnakeCase(propValue)) {
        return;
      }
      state.translations.add(propValue);
    }
  });
};

const handleCallExpression = (
  callExpression: CallExpression,
  name: TranslationFunctionNames,
  state: State,
) => {
  const [arg1, arg2] = callExpression.getArguments();

  const translationKeyArgs = name === "getTextBody" ? [arg1, arg2] : [arg1];

  translationKeyArgs.forEach((translationKeyArg) => {
    if (Node.isStringLiteral(translationKeyArg)) {
      state.translations.add(translationKeyArg.getLiteralText());
    }

    if (Node.isTemplateExpression(translationKeyArg)) {
      addTemplateHeadTextToKeyHeads(state, translationKeyArg);
      addTemplateTailTextToKeyTails(state, translationKeyArg);
    }

    if (
      Node.isConditionalExpression(translationKeyArg) ||
      Node.isBinaryExpression(translationKeyArg)
    ) {
      const keyLikeStringLiterals = translationKeyArg
        .getDescendantsOfKind(SyntaxKind.StringLiteral)
        .filter((s) => /^[a-z1-9]+(_[a-z1-9]+)*$/.test(s.getLiteralText()));

      keyLikeStringLiterals.forEach((literal) => {
        state.translations.add(literal.getLiteralText());
      });
    }
  });
};

const handleJsxOpeningElement = (
  jsxOpeningElement: JsxOpeningElement,
  state: State,
) => {
  jsxOpeningElement.getAttributes().forEach((attribute) => {
    if (!Node.isJsxAttribute(attribute)) {
      return;
    }

    const initializer = attribute.getInitializer();

    if (Node.isStringLiteral(initializer)) {
      state.translations.add(initializer.getLiteralText());
      return;
    }

    if (Node.isJsxExpression(initializer)) {
      const expression = initializer.getExpression();

      if (Node.isTemplateExpression(expression)) {
        addTemplateHeadTextToKeyHeads(state, expression);
        addTemplateTailTextToKeyTails(state, expression);
        return;
      }

      if (
        Node.isConditionalExpression(expression) ||
        Node.isBinaryExpression(expression)
      ) {
        const keyLikeStringLiterals = expression
          .getDescendantsOfKind(SyntaxKind.StringLiteral)
          .filter((s) => isNotSnakeCase(s.getLiteralText()));

        keyLikeStringLiterals.forEach((literal) => {
          state.translations.add(literal.getLiteralText());
        });
      }
      return;
    }
  });
};

const handleTransNamedImport = (
  importSpecifier: ImportSpecifier,
  state: State,
) => {
  const nameNode = importSpecifier.getNameNode();

  nameNode.findReferencesAsNodes().forEach((reference) => {
    const parent = reference.getParent();

    if (!Node.isJsxOpeningElement(parent)) {
      return;
    }

    handleJsxOpeningElement(parent, state);
  });
};

const handleImportDeclaration = (
  importDeclaration: ImportDeclaration,
  state: State,
) => {
  const moduleSpecifierText = importDeclaration
    .getModuleSpecifier()
    .getLiteralText();

  if (moduleSpecifierText === "next-i18next") {
    const transNamedImport = importDeclaration
      .getNamedImports()
      .find((namedImport) => namedImport.getName() === "Trans");

    if (transNamedImport) {
      handleTransNamedImport(transNamedImport, state);
    }
  }
};

const getCallExpressionName = (callExpression: CallExpression) => {
  const expr = callExpression.getExpression();

  if (Node.isIdentifier(expr)) {
    return expr.getText();
  }

  if (Node.isPropertyAccessExpression(expr)) {
    return expr.getNameNode().getText();
  }

  return null;
};

const handleSourceFile = (sourceFile: SourceFile, state: State) => {
  sourceFile
    .getImportDeclarations()
    .forEach((importDeclaration) =>
      handleImportDeclaration(importDeclaration, state),
    );

  sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement)
    .forEach((element) => {
      if (element.getTagNameNode().getFullText().length === 0) {
        return;
      }
      handleJSXElement(element, state);
    });

  sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .forEach((element) => {
      if (element.getTagNameNode().getFullText().length === 0) {
        return;
      }
      handleJSXElement(element, state);
    });

  // handle t and language callExpressions
  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .forEach((callExpression) => {
      const name = getCallExpressionName(callExpression);

      if (name === null || !isTranslationFunctionName(name)) {
        return;
      }

      handleCallExpression(callExpression, name, state);
    });

  return sourceFile;
};

const buildSourceFile = (
  tsmorph: Dependencies["tsmorph"],
  data: string,
  path: string,
) => {
  const project = new tsmorph.Project({
    useInMemoryFileSystem: true,
    skipFileDependencyResolution: true,
    compilerOptions: {
      allowJs: true,
    },
  });

  return project.createSourceFile(String(path), String(data));
};

const handleLocaleFile = (sourceFile: SourceFile, state: State) => {
  const objectLiteralExpression = sourceFile.getDescendantsOfKind(
    SyntaxKind.ObjectLiteralExpression,
  )[0];

  objectLiteralExpression?.getProperties().forEach((propertyAssignment) => {
    if (!Node.isPropertyAssignment(propertyAssignment)) {
      return;
    }

    const nameNode = propertyAssignment.getNameNode();

    if (!Node.isStringLiteral(nameNode)) {
      return;
    }

    const name = nameNode.getLiteralText();

    for (const keyHead of state.keyHeads) {
      if (name.startsWith(keyHead)) {
        return;
      }
    }

    for (const keyTail of state.keyTails) {
      if (name.endsWith(keyTail)) {
        return;
      }
    }

    if (state.translations.has(name)) {
      return;
    }

    propertyAssignment.remove();
  });
};

type State = {
  translations: Set<string>;
  keyHeads: Set<string>;
  keyTails: Set<string>;
  translationsCollected: boolean;
};

export const repomod: Filemod<Dependencies, State> = {
  includePatterns: ["**/*.{js,jsx,ts,tsx,cjs,mjs,json}"],
  excludePatterns: ["**/node_modules/**"],
  initializeState: async (_, previousState) => {
    return (
      previousState ?? {
        translations: new Set(),
        keyHeads: new Set(),
        keyTails: new Set(),
        translationsCollected: false,
      }
    );
  },
  handleFinish: async (_, state) => {
    if (state === null || state.translationsCollected) {
      return { kind: "noop" };
    }

    state.translationsCollected = true;

    return {
      kind: "restart",
    };
  },
  handleData: async (api, path, data, options, state) => {
    if (state === null) {
      return {
        kind: "noop",
      };
    }

    if (!state.translationsCollected && !path.endsWith(".json")) {
      const { tsmorph } = api.getDependencies();

      handleSourceFile(buildSourceFile(tsmorph, data, path), state);
    }

    if (
      state.translationsCollected &&
      (state.translations.size !== 0 ||
        state.keyHeads.size !== 0 ||
        state.keyTails.size !== 0) &&
      path.includes("public/static/locales")
    ) {
      const sourceFile = buildSourceFile(tsmorph, `(${data})`, path);
      handleLocaleFile(sourceFile, state);
      const fullText = sourceFile.getFullText();

      return {
        kind: "upsertData",
        path,
        data: sourceFile.getFullText().slice(1, fullText.length - 1),
      };
    }

    return {
      kind: "noop",
    };
  },
};
