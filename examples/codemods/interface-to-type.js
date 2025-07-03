/**
 * Codemod to convert TypeScript interfaces to type aliases
 * This is an example codemod for the js-ast-grep workflow
 */

export default function transform(sgRoot) {
  const rootNode = sgRoot.root();
  const interfaces = rootNode.findAll({
    rule: {
      pattern: "interface $NAME { $$$BODY }",
    },
  });

  const edits = interfaces.map((node) => {
    const name = node.getMatch("NAME");
    const body = node.getMatch("BODY");
    return node.replace(`type ${name} = { ${body} }`);
  });

  return rootNode.commitEdits(edits);
}
