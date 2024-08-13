import type { API, FileInfo, Options } from "jscodeshift";

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);
  let isDirty = false;

  // Get default import from test utils
  const defaultUtilsImportName = root
    .find(j.ImportDeclaration, {
      source: { value: "react-dom/test-utils" },
      specifiers: [{ type: "ImportDefaultSpecifier" }],
    })
    .paths()
    .at(0)
    ?.node.specifiers?.at(0)?.local?.name;

  // Get default import from test utils
  const starUtilsImportName = root
    .find(j.ImportDeclaration, {
      source: { value: "react-dom/test-utils" },
      specifiers: [{ type: "ImportNamespaceSpecifier" }],
    })
    .paths()
    .at(0)
    ?.node.specifiers?.at(0)?.local?.name;

  const utilsCalleeName = defaultUtilsImportName ?? starUtilsImportName;
  const utilsCalleeType: any = defaultUtilsImportName
    ? "ImportDefaultSpecifier"
    : "ImportNamespaceSpecifier";

  // For usages like `import * as ReactTestUtils from 'react-dom/test-utils'; ReactTestUtils.act()`
  const actAccessExpressions = root.find(j.MemberExpression, {
    object: { name: utilsCalleeName },
    property: { name: "act" },
  });

  if (actAccessExpressions.length > 0) {
    // React import
    const defaultReactImportName = root
      .find(j.ImportDeclaration, { source: { value: "react" } })
      .paths()
      .at(0)
      ?.node.specifiers?.at(0)?.local?.name;

    if (!defaultReactImportName) {
      const importNode =
        utilsCalleeType === "ImportDefaultSpecifier"
          ? j.importDefaultSpecifier
          : j.importNamespaceSpecifier;

      const reactImport = j.importDeclaration(
        [importNode(j.identifier("React"))],
        j.literal("react"),
      );

      root.get().node.program.body.unshift(reactImport);
      isDirty = true;
    }

    actAccessExpressions.forEach((path) => {
      const accessedPath = j(path)
        .find(j.Identifier, { name: utilsCalleeName })
        .paths()
        .at(0);

      const newIdentifier = j.identifier.from({
        name: defaultReactImportName ?? "React",
      });

      accessedPath?.replace(newIdentifier);
      isDirty = true;
    });

    // Remove the old import
    root
      .find(j.ImportDeclaration, {
        source: { value: "react-dom/test-utils" },
        specifiers: [{ type: utilsCalleeType }],
      })
      .remove();

    isDirty = true;
  }

  root
    .find(j.ImportDeclaration, {
      source: { value: "react-dom/test-utils" },
      specifiers: [{ type: "ImportSpecifier", imported: { name: "act" } }],
    })
    .forEach((path) => {
      const newImportSpecifier = j.importSpecifier(
        j.identifier("act"),
        j.identifier("act"),
      );

      const existingReactImportCollection = root.find(j.ImportDeclaration, {
        source: { value: "react" },
        importKind(value) {
          return value === "value" || value == null;
        },
        specifiers: [{ type: "ImportSpecifier" }],
      });

      if (existingReactImportCollection.length > 0) {
        existingReactImportCollection
          .paths()
          .at(0)
          ?.node.specifiers?.push(newImportSpecifier);

        path.prune();
        isDirty = true;
      } else {
        const newImportDeclaration = j.importDeclaration(
          [newImportSpecifier],
          j.literal("react"),
        );

        path.replace(newImportDeclaration);
        isDirty = true;
      }
    });

  /**
   * handle re-exports:
   * export * from 'react-dom/test-utils';
   */
  root.find(j.ExportAllDeclaration).forEach((path) => {
    if (path.node.source.value === "react-dom/test-utils") {
      const newExportDeclaration = j.exportNamedDeclaration.from({
        declaration: null,
        specifiers: [
          j.exportSpecifier.from({
            local: j.identifier("act"),
            exported: j.identifier("act"),
          }),
        ],
        source: j.literal("react"),
      });

      // add export { act } from "react";
      path.insertAfter(newExportDeclaration);
      isDirty = true;
    }
  });

  return isDirty ? root.toSource() : undefined;
}
