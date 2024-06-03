import type {
  ImportDeclaration,
  JsxElement,
  JsxOpeningElement,
  SourceFile,
} from "ts-morph";
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
  _: string,
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
  getReplacer: (key: string, type: VariableType, value: VariableValue) => {
    return getVariableValueReplacerNode(key, type, value);
  },
};

const removeMockFeatureFlagComponent = (mockFeatureFlag: JsxElement) => {
  const children = mockFeatureFlag
    .getJsxChildren()
    .filter((c) => !(Node.isJsxText(c) && c.getFullText().trim() === ""));

  const text = children.reduce<string>((acc, child) => {
    // biome-ignore lint: args reassing
    acc += `${child.getFullText()}`;
    return acc;
  }, "");

  mockFeatureFlag.replaceWithText(
    children.length === 1 ? text : `<>${text}</>`,
  );
};

const removeImport = (mockFeatureFlagImport: ImportDeclaration) => {
  const namedImports = mockFeatureFlagImport.getNamedImports();

  if (namedImports.length !== 0) {
    return;
  }

  mockFeatureFlagImport.remove();
};

const matchMockFeatureFlag = (jsx: JsxOpeningElement) => {
  if (
    jsx.wasForgotten() ||
    jsx.getTagNameNode()?.getFullText() !== "MockFeatureFlag"
  ) {
    return null;
  }

  const mockFlagsAttribute = jsx
    .getAttribute("mockFlags")
    ?.getFirstDescendantByKind(SyntaxKind.ObjectLiteralExpression);

  if (mockFlagsAttribute === undefined) {
    return null;
  }

  const tag = jsx.getTagNameNode();

  if (!Node.isIdentifier(tag)) {
    return null;
  }

  const parent = jsx.getParent();

  if (!Node.isJsxElement(parent)) {
    return null;
  }

  const importDeclaration = tag
    ?.getDefinitions()
    .at(0)
    ?.getNode()
    ?.getFirstAncestorByKind(SyntaxKind.ImportDeclaration);

  return {
    mockFlagsAttribute,
    jsx,
    tag,
    parent,
    importDeclaration,
  };
};

const removeFeatureFlagKeyFromFlagsDict = (
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

const removeMockFlagsAttributes = (
  sourceFile: SourceFile,
  options: Options,
) => {
  sourceFile
    .getDescendantsOfKind(SyntaxKind.JsxOpeningElement)
    .forEach((jsx) => {
      const match = matchMockFeatureFlag(jsx);

      if (match === null) {
        return;
      }

      const { mockFlagsAttribute, parent, importDeclaration } = match;

      mockFlagsAttribute.getProperty(options.key)?.remove();

      // remove the whole Provider and its import if no properties left after key removal
      if (mockFlagsAttribute.getProperties().length === 0) {
        removeMockFeatureFlagComponent(parent);

        if (importDeclaration !== undefined) {
          removeImport(importDeclaration);
        }
      }
    });
};

const removeMockFeatureFlagArgs = (
  sourceFile: SourceFile,
  options: Options,
) => {
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
   * Removes the feature flag key type property from FlagDict
   */

  if (filePath.endsWith("FeatureFlagProvider.tsx")) {
    removeFeatureFlagKeyFromFlagsDict(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  /**
   * removes feature flag key from mockFlags attribute in MockFeatureFlag component
   */
  if (filePath.endsWith("spec.tsx")) {
    removeMockFlagsAttributes(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  /**
   * removes feature flag from stories `args`
   */
  if (filePath.endsWith("stories.tsx")) {
    removeMockFeatureFlagArgs(sourceFile, optionsWithProvider);
    return sourceFile.getFullText();
  }

  return handleSourceFileCore(sourceFile, optionsWithProvider);
}
