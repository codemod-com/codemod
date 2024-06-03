import type { SourceFile } from "ts-morph";
import { type CallExpression, Node, SyntaxKind, ts } from "ts-morph";

import { handleSourceFile as handleSourceFileCore } from "../../../replace-feature-flag-core/src/index.js";
import type {
  Options,
  Provider,
  VariableType,
  VariableValue,
} from "../../../replace-feature-flag-core/src/types.js";

import {
  buildLiteral,
  getCEExpressionName,
} from "../../../replace-feature-flag-core/src/utils.js";

const names = ["useFlag"];

const getVariableValueReplacerNode = (
  key: string,
  type: VariableType,
  value: VariableValue,
) => {
  return buildLiteral(type, value);
};

type MatchedMethod = {
  name: string;
};

export const provider: Provider = {
  getMatcher:
    (keyName: string) =>
    (ce: CallExpression): MatchedMethod | null => {
      const name = getCEExpressionName(ce);

      if (name === null || !names.includes(name)) {
        return null;
      }

      const args = ce.getArguments();
      const keyArg = args.at(0);

      if (Node.isStringLiteral(keyArg) && keyArg.getLiteralText() === keyName) {
        return { name };
      }

      return null;
    },
  getReplacer: (
    key: string,
    type: VariableType,
    value: VariableValue,
    name: string,
  ) => {
    return getVariableValueReplacerNode(key, type, value);
  },
};

const removeFeatureFlagProperty = (
  sourceFile: SourceFile,
  options: Options,
) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.TypeAliasDeclaration)
    .forEach((tad) => {
      if (tad.getName() !== "FlagDict") {
        return;
      }

      const type = tad.getTypeNode();

      if (!Node.isTypeLiteral(type)) {
        return;
      }

      type.getProperty(options.key)?.remove();
    });
};

const removeMockedFlags = (sourceFile: SourceFile, options: Options) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .forEach((jsx) => {
      if (jsx.wasForgotten()) {
        return;
      }

      const tag = jsx.getTagNameNode();

      if (!Node.isIdentifier(tag) || tag.getFullText() !== "MockFeatureFlag") {
        return;
      }

      const mockFlagsAttr = jsx.getAttribute("mockFlags");

      const expression = mockFlagsAttr?.getFirstDescendantByKind(
        SyntaxKind.ObjectLiteralExpression,
      );

      if (expression === undefined) {
        return;
      }

      expression.getProperty(options.key)?.remove();

      // remove the whole Provider and its import if no properties left after key removal
      if (expression.getProperties().length === 0) {
        const jsxElement = jsx.getParent();

        if (!Node.isJsxElement(jsxElement)) {
          return;
        }

        const def = tag.getDefinitions().at(0);

        const maybeImportDeclaration = def
          ?.getNode()
          ?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);

        if (!Node.isImportDeclaration(maybeImportDeclaration)) {
          return;
        }

        const namedImports = maybeImportDeclaration.getNamedImports();

        if (namedImports.length === 0) {
          maybeImportDeclaration.remove();
        }

        const text = jsxElement
          .getJsxChildren()
          .reduce<string>((acc, child) => {
            acc += `${child.getFullText()}`;
            return acc;
          }, "");

        jsxElement.replaceWithText(`<>${text}</>`);
      }
    });
};

const removeMockFlagsStories = (sourceFile: SourceFile, options: Options) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .forEach((ole) => {
      ole.getProperty(options.key)?.remove();
    });
};

export function handleSourceFile(
  sourceFile: SourceFile,
  options: Omit<Options, "provider">,
): string | undefined {
  const filePath = sourceFile.getFilePath();

  const optionsWithProvider = { ...options, provider };

  /**
   * Removes the `${key}` type property from FlagDict type literal
   */

  if (filePath.endsWith("FeatureFlagProvider.tsx")) {
    removeFeatureFlagProperty(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  /**
   * removes feature flag from mockFlags
   */
  if (filePath.endsWith("spec.tsx")) {
    removeMockedFlags(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  if (filePath.endsWith("stories.tsx")) {
    removeMockFlagsStories(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  return handleSourceFileCore(sourceFile, optionsWithProvider);
}
