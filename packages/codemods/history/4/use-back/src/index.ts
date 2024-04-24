import type { API, FileInfo } from "jscodeshift";

function transform(file: FileInfo, api: API): string | undefined {
  const j = api.jscodeshift;

  const root = j(file.source);

  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        object: { name: "history" },
        property: { name: "goBack" },
      },
    })
    .forEach((path) => {
      const identifierPath = j(path)
        .find(j.Identifier, { name: "goBack" })
        .paths()
        .at(0);

      if (!identifierPath) {
        return;
      }

      identifierPath.replace(j.identifier.from({ name: "back" }));
    });

  return root.toSource();
}

export default transform;
