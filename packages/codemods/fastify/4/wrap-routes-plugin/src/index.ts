import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all fastify.get calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "fastify" },
        property: { name: "get" },
      },
    })
    .forEach((path) => {
      // Create a new fastify.register call
      const registerCall = j.expressionStatement(
        j.callExpression(
          j.memberExpression(j.identifier("fastify"), j.identifier("register")),
          [
            j.arrowFunctionExpression(
              [
                j.identifier("instance"),
                j.identifier("opts"),
                j.identifier("done"),
              ],
              j.blockStatement([
                j.expressionStatement(
                  j.callExpression(
                    j.memberExpression(
                      j.identifier("instance"),
                      j.identifier("get"),
                    ),
                    path.node.arguments,
                  ),
                ),
                j.expressionStatement(
                  j.callExpression(j.identifier("done"), []),
                ),
              ]),
            ),
          ],
        ),
      );

      // Insert the new register call after the original fastify.get call
      j(path.parent).insertAfter(registerCall);

      // Remove the original fastify.get call
      j(path).remove();

      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
