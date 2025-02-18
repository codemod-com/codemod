import { defaultJSCodeshiftParser } from "@codemod.com/codemod-utils";
import jscodeshift from "jscodeshift";

export const isTheSameData = (oldData: string, newData: string) => {
  if (oldData === newData) {
    return true;
  }

  try {
    // sometimes codemods produce newData even though they are literally no changes
    // by removing parentheses around return statements, we will likely find the pointless results
    const oldRoot = jscodeshift.withParser(defaultJSCodeshiftParser)(oldData);
    const newRoot = jscodeshift.withParser(defaultJSCodeshiftParser)(newData);

    oldRoot
      .find(jscodeshift.ParenthesizedExpression)
      .replaceWith((path) => path.node.expression);

    newRoot
      .find(jscodeshift.ParenthesizedExpression)
      .replaceWith((path) => path.node.expression);

    return oldRoot.toSource() === newRoot.toSource();
  } catch (err) {
    return false;
  }
};

export const getRandomMjs = () => {
  return `${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}.mjs`;
};

export const shouldRunAsChildNodeProcess = (codemodName: string) => {
  return codemodName === "correct-ts-specifiers";
};
