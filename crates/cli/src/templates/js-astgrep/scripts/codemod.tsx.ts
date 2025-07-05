import type { SgRoot } from "@ast-grep/napi";
import type TSX from "@ast-grep/napi/lang/tsx";

async function transform(root: SgRoot<TSX>): Promise<string> {
  const rootNode = root.root();

  const nodes = rootNode.findAll({
    rule: {
      any: [
        { pattern: "console.log($ARG)" },
        { pattern: "console.debug($ARG)" },
      ],
    },
  });

  const edits = nodes.map((node) => {
    const arg = node.getMatch("ARG").text();
    return node.replace(`logger.log(${arg})`);
  });

  const newSource = rootNode.commitEdits(edits);
  return newSource;
}

export default transform;
