// BUILT WITH https://codemod.studio

import type {
  API,
  ASTPath,
  ClassDeclaration,
  Collection,
  FileInfo,
  JSCodeshift,
  Options,
} from "jscodeshift";

const getMatcher =
  (
    j: JSCodeshift,
    importSpecifiersLocalNames: string[],
    importedModuleName: string,
  ) =>
  (path: ASTPath<ClassDeclaration>) => {
    const { superClass } = path.value;

    let component = null;

    if (
      j.Identifier.check(superClass) &&
      importSpecifiersLocalNames.includes(superClass.name)
    ) {
      component = path.value;
    }

    if (
      j.MemberExpression.check(superClass) &&
      j.Identifier.check(superClass.object) &&
      superClass.object.name === importedModuleName &&
      j.Identifier.check(superClass.property)
    ) {
      component = path.value;
    }

    if (!component) {
      return null;
    }

    const renderMethod =
      component.body.body.find(
        (node) =>
          j.ClassMethod.check(node) &&
          j.Identifier.check(node.key) &&
          node.key.name === "render",
      ) ?? null;

    const renderedJsx = renderMethod
      ? j(renderMethod).find(j.ReturnStatement).paths().at(0)
      : null;

    return {
      component,
      renderMethod,
      renderedJsx,
    };
  };

const collectImportNames = (
  j: JSCodeshift,
  root: Collection,
  source: string,
) => {
  const importSpecifierLocalNames = new Map<string, string>();

  let importDefaultSpecifierName: string | null = null;
  let importNamespaceSpecifierName: string | null = null;

  root
    .find(j.ImportDeclaration, {
      source: { value: source },
    })
    .forEach((path) => {
      path.value.specifiers?.forEach((specifier) => {
        if (j.ImportSpecifier.check(specifier)) {
          importSpecifierLocalNames.set(
            specifier.imported.name,
            specifier.local?.name ?? "",
          );
        }

        if (j.ImportDefaultSpecifier.check(specifier) && specifier.local) {
          importDefaultSpecifierName = specifier.local.name;
        }

        if (j.ImportNamespaceSpecifier.check(specifier) && specifier.local) {
          importNamespaceSpecifierName = specifier.local.name;
        }
      });
    });

  return {
    importSpecifierLocalNames,
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
  };
};

// @TODO helper get react component

export default function transform(
  file: FileInfo,
  api: API,
  options?: Options,
): string | undefined {
  const j = api.jscodeshift;
  const root = j(file.source);

  const {
    importDefaultSpecifierName,
    importNamespaceSpecifierName,
    importSpecifierLocalNames,
  } = collectImportNames(j, root, "react");

  const moduleName =
    importNamespaceSpecifierName ?? importDefaultSpecifierName ?? "";

  const matchReactClassComponent = getMatcher(
    j,
    [...importSpecifierLocalNames.values()],
    moduleName,
  );

  j.find(j.ClassDeclaration).forEach((path) => {
    const match = matchReactClassComponent(path);

    if (match === null) {
      return;
    }

    const { component, renderMethod, renderedJsx } = match;

    let returnValue = null;
    component.body.body.forEach((node) => {
      if (j.ClassMethod.check(node) && j.Identifier.check(node.key)) {
        const name = node.key.name;

        if (name !== "getChildContext") {
          returnValue =
            j(node).find(j.ReturnStatement).paths().at(0)?.value ?? null;
        }
      }
    });

    if (returnValue) {
    }
  });
  return root.toSource();
}
