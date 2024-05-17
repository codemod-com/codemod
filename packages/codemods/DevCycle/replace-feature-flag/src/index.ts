import {
  Node,
  ObjectLiteralElement,
  type ObjectLiteralExpression,
  type PropertyAssignment,
  type SourceFile,
  SyntaxKind,
  ts,
} from "ts-morph";
import { DVC } from "./dvc.js";

type VariableType = "String" | "Boolean" | "Number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;

export type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  aliases?: Record<string, string>;
};

// const replaceObjects = (sourceFile: SourceFile, options: Options) => {
//   sourceFile
//     .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
//     .forEach(() => {});
//   let propertyAccessed = null;

//   if (Node.isPropertyAccessExpression(dp)) {
//     propertyAccessed = dp.getNameNode()?.getFullText() ?? null;
//   }

//   if (Node.isElementAccessExpression(dp)) {
//     propertyAccessed = dp.getArgumentExpression()?.getFullText() ?? null;
//   }
// };

const getPropertyValueAsText = (
  ole: ObjectLiteralExpression,
  propertyName: string,
) => {
  const property = ole.getProperty(propertyName);

  if (!Node.isPropertyAssignment(property)) {
    return null;
  }

  const propertyValue = property.getInitializer();

  if (
    !Node.isStringLiteral(propertyValue) &&
    !Node.isNumericLiteral(propertyValue) &&
    !Node.isTrueLiteral(propertyValue) &&
    !Node.isFalseLiteral(propertyValue)
  ) {
    return null;
  }

  return propertyValue.getFullText();
};

export function handleSourceFile(
  sourceFile: SourceFile,
  options: Options,
): string | undefined {
  const matcher = DVC.getMatcher(options.key);

  sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach((ce) => {
    const match = matcher(ce);

    if (match === null) {
      return;
    }

    if (ce.getParent()?.getKind() === SyntaxKind.ExpressionStatement) {
      ce.getParent()?.replaceWithText(
        DVC.getReplacer(options.key, options.type, options.value, match.name),
      );

      return;
    }

    ce.replaceWithText(
      DVC.getReplacer(options.key, options.type, options.value, match.name),
    );
  });

  sourceFile
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .forEach((ole) => {
      const parent = ole.getParent();

      if (Node.isPropertyAccessExpression(parent)) {
        const nameNode = parent.getNameNode();

        if (!Node.isIdentifier(nameNode)) {
          return;
        }

        const text = getPropertyValueAsText(ole, nameNode.getText());

        if (text !== null) {
          parent.replaceWithText(text);
        }
      }

      if (!parent.wasForgotten() && Node.isElementAccessExpression(parent)) {
        const arg = parent.getArgumentExpression();

        if (!Node.isStringLiteral(arg)) {
          return;
        }

        const text = getPropertyValueAsText(ole, arg.getLiteralText());

        if (text !== null) {
          parent.replaceWithText(text);
        }
      }
    });

  return sourceFile.getFullText();
}
