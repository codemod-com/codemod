/**
 * Codemod to remove console.log statements
 * This is an example codemod for the js-ast-grep workflow
 */

export default function transform(ast) {
  const rootNode = ast.root();
  const consoleLogs = rootNode.findAll({
    rule: {
      pattern: "console.log($$$ARGS);",
    },
  });

  return rootNode.commitEdits(consoleLogs.map((node) => node.replace("")));
}
