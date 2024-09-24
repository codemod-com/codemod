import { API, FileInfo } from "jscodeshift";

export default function transformer(fileInfo: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(fileInfo.source);

  // Find all CallExpressions where .uniforms() is called
  root
    .find(j.CallExpression, {
      callee: {
        type: "MemberExpression",
        property: {
          name: "uniforms",
        },
      },
    })
    .forEach((path) => {
      // Replace 'uniforms' with 'uniformArray'
      path.node.callee.property.name = "uniformArray";
    });

  return root.toSource();
}
