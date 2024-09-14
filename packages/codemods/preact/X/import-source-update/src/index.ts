export default function transform(fileInfo, api) {
  const j = api.jscodeshift;

  return j(fileInfo.source)
    .find(j.ImportDeclaration)
    .forEach((path) => {
      const importSource = path.node.source.value;

      // Update imports from 'preact-compat' to 'preact/compat'
      if (importSource === "preact-compat") {
        path.node.source.value = "preact/compat";
      }

      // Update imports from 'preact-redux' to 'react-redux'
      if (importSource === "preact-redux") {
        path.node.source.value = "react-redux";
      }

      // Update imports from 'mobx-preact' to 'mobx-react'
      if (importSource === "mobx-preact") {
        path.node.source.value = "mobx-react";
      }
    })
    .toSource();
}
