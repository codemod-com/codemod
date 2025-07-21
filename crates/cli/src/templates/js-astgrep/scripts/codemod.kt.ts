import type { SgRoot } from "@ast-grep/napi";

async function transform(root: SgRoot): Promise<string | null> {
  const rootNode = root.root();

  // Find simple null checks followed by return
  const simpleNullChecks = rootNode.findAll({
    rule: {
      pattern: "if ($VAR == null) { return $DEFAULT }",
    },
  });

  let edits = simpleNullChecks.map((node) => {
    const variableName = node.getMatch("VAR").text();
    const defaultValue = node.getMatch("DEFAULT").text();
    return node.replace(
      `val ${variableName}Safe = ${variableName} ?: return ${defaultValue}`,
    );
  });

  // Find negated null checks with nested operations
  const negatedNullChecks = rootNode.findAll({
    rule: {
      pattern: `
        if ($VAR != null) {
          $BODY
        } else {
          return $DEFAULT
        }
      `,
    },
  });

  edits = [
    ...edits,
    ...negatedNullChecks.map((node) => {
      const variableName = node.getMatch("VAR").text();
      const body = node.getMatch("BODY").text();
      const defaultValue = node.getMatch("DEFAULT").text();
      return node.replace(`val ${variableName}Safe = ${variableName} ?: return ${defaultValue}
${body}`);
    }),
  ];

  // Find inline null checks
  const inlineNullChecks = rootNode.findAll({
    rule: {
      pattern: "if ($VAR == null) return $DEFAULT",
    },
  });

  edits = [
    ...edits,
    ...inlineNullChecks.map((node) => {
      const variableName = node.getMatch("VAR").text();
      const defaultValue = node.getMatch("DEFAULT").text();
      return node.replace(
        `val ${variableName}Safe = ${variableName} ?: return ${defaultValue}`,
      );
    }),
  ];

  // Apply all changes
  const newSource = rootNode.commitEdits(edits);
  return newSource;
}

export default transform;
