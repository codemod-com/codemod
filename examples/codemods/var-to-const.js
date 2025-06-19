/**
 * Simple var to let codemod for testing
 */

export default function transform(sgRoot) {
  const rootNode = sgRoot.root();
  const varDeclarations = rootNode.findAll({
    rule: {
      pattern: "var $VAR = $VALUE",
    },
  });

  return rootNode.commitEdits(
    varDeclarations.map((node) => node.replace("let $VAR = $VALUE")),
  );
}
