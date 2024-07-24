import jscodeshift from "jscodeshift";
import { defaultParser } from "#parsers/jscodeshift.js";

export const isTheSameData = (oldData: string, newData: string) => {
  try {
    // sometimes codemods produce newData even though they are literally no changes
    // by removing parentheses around return statements, we will likely find the pointless results
    const oldRoot = jscodeshift.withParser(defaultParser)(oldData);
    const newRoot = jscodeshift.withParser(defaultParser)(newData);

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
