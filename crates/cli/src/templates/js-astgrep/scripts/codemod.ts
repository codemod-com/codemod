import type { SgRoot } from "codemod:ast-grep";
import type JS from "@codemod.com/ast-grep-langs/javascript";

async function transform(root: SgRoot<JS>): Promise<string> {
  const rootNode = root.root();

  const nodes = rootNode.findAll({
    rule: {
      pattern: "var $VAR = $VALUE",
    },
  });

  const edits = nodes.map((node) => {
    const varName = node.getMatch("VAR").text();
    const value = node.getMatch("VALUE").text();
    return node.replace(`const ${varName} = ${value}`);
  });

  const newSource = rootNode.commitEdits(edits);
  return newSource;
}

export default transform;
