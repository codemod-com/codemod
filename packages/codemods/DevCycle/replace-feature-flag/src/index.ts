import {
  Node,
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

        console.log(nameNode.getFullText(), "??");

        if (Node.isIdentifier(nameNode)) {
          let property: PropertyAssignment | undefined;

          ole.getProperties().forEach((p) => {
            if (
              Node.isPropertyAssignment(p) &&
              Node.isIdentifier(p.getNameNode()) &&
              p.getNameNode().getText() === nameNode.getText()
            ) {
              property = p;
            }
          });

          const propertyValue =
            property !== undefined ? property.getInitializer() : null;

          const text = propertyValue?.getFullText() ?? null;

          if (text !== null) {
            parent.replaceWithText(text);
          }
        }
      }
    });

  return sourceFile.getFullText();
}
