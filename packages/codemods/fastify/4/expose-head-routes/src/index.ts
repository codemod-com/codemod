import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);
  let dirtyFlag = false;

  // Find all fastify.listen calls
  root
    .find(j.CallExpression, {
      callee: {
        object: { name: "fastify" },
        property: { name: "listen" },
      },
    })
    .forEach((path) => {
      // Insert comment above the fastify.listen call
      const comment = j.commentLine(
        " A HEAD request to the /example endpoint will automatically respond with the same headers as the GET request.",
      );
      path.value.comments = path.value.comments || [];
      path.value.comments.unshift(comment);
      dirtyFlag = true;
    });

  return dirtyFlag ? root.toSource() : undefined;
}
