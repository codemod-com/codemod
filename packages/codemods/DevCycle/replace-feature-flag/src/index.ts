import { type SourceFile, SyntaxKind, ts } from "ts-morph";
import { DVC } from "./dvc.js";

const { factory } = ts;
type SDKDescriptor = {
  getKeyArgument: <T>(args: T[]) => T;
  isSDKMethod: (name: string) => boolean;
};

type VariableType = "string" | "boolean" | "number" | "JSON";
type VariableValue = string | boolean | number | Record<string, unknown>;

type Options = {
  key: string;
  value: VariableValue;
  type: VariableType;
  aliases?: Record<string, string>;
  sdkDescriptor: SDKDescriptor;
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

export function handleSourceFile(sourceFile: SourceFile): string | undefined {
  const options = {
    key: "simple-case",
    type: "string",
    value: "string",
  } as const;

  const matcher = DVC.getMatcher(options.key);

  sourceFile
    .getDescendantsOfKind(SyntaxKind.CallExpression)
    .filter(matcher)
    .forEach((ce) => {
      ce.getParent()?.replaceWithText(
        DVC.getReplacer(options.key, options.type, options.value),
      );
    });

  return sourceFile.getFullText();
}
