import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all CallExpressions where the callee is fastify.register
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "fastify" },
        property: { name: "register" },
      },
    })
    .forEach((path) => {
      // Check if the parent node is an AwaitExpression
      const parent = path.parent.node;
      if (!j.AwaitExpression.check(parent)) {
        // Replace the CallExpression with an AwaitExpression
        j(path).replaceWith(j.awaitExpression(path.node));
        dirtyFlag = true;
      }
    });

  return dirtyFlag ? root.toSource() : undefined;
}
