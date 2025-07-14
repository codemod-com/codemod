import type { SgRoot } from "@ast-grep/napi";
import { registerCodemod } from "../../src/mod.ts";

// Work with `npx codemod@next`
export default async function transform(root: SgRoot): Promise<string> {
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
    const arg = node.getMatch("ARG")?.text();
    return node.replace(`logger.log(${arg})`);
  });

  const newSource = rootNode.commitEdits(edits);
  return newSource;
}

// Register the codemod to use as `node src/transform.ts`
registerCodemod(transform, "invalid-language");
